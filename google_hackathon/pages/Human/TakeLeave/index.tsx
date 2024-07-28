"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/Pagination";
import { useRouter } from "next/router";
import Header from "@/components/ui/HR Components/Header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";

type TakeLeave = {
  timestamp: string;
  emailAddress: string;
  fullName: string;
  employeeID: string;
  daysTotal: string;
  startDate: string;
  endDate: string;
  skills: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
};

const getColumns = (
  activeTab: string,
  handleApprove: (row: TakeLeave) => void,
  handleDelete: (row: TakeLeave) => void
): ColumnDef<TakeLeave>[] => [
  { accessorKey: "emailAddress", header: "Email Address" },
  { accessorKey: "fullName", header: "Full Name" },
  { accessorKey: "employeeID", header: "Employee ID" },
  { accessorKey: "daysTotal", header: "Days in Total" },
  {
    accessorKey: "startDate",
    header: "Leave Start Date",
    cell: (info) => {
      const date = new Date(info.getValue() as string);
      return date.toLocaleDateString();
    },
  },
  {
    accessorKey: "endDate",
    header: "Leave End Date",
    cell: (info) => {
      const date = new Date(info.getValue() as string);
      return date.toLocaleDateString();
    },
  },
  { accessorKey: "reason", header: "Reason" },
  {
    id: "actions",
    header: "Actions",
    cell: (info) => {
      const row = info.row.original;
      return (
        <div className="flex space-x-2">
          {activeTab === "Pending" && (
            <>
              <Button
                onClick={() => handleApprove(row)}
                className="bg-green-500 text-white"
              >
                Approve
              </Button>
              <Button
                onClick={() => handleDelete(row)}
                className="bg-red-500 text-white"
              >
                Delete
              </Button>
            </>
          )}
        </div>
      );
    },
  },
];

const getNewEmployeeCount = (data: TakeLeave[]) => {
  return data.filter((employee) => {
    const hireYear = new Date(employee.timestamp).getFullYear();
    return hireYear === 2024;
  }).length;
};

function DataTable<TData extends TakeLeave>({
  columns,
  data,
  onRowClick,
  onFilterChange,
  activeTab,
}: {
  columns: ColumnDef<TData>[];
  data: TData[];
  onRowClick: (row: TData) => void;
  onFilterChange: (column: string, value: string) => void;
  activeTab: string;
}) {
  const router = useRouter();
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleRowClick = (WorkerId: string) => {
    router.push(`/TakeLeave/${WorkerId}`);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <React.Fragment key={headerGroup.id}>
              <TableRow>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
              <TableRow>
                {headerGroup.headers.map(
                  (header) =>
                    header.id !== "actions" && (
                      <TableCell key={header.id} className="p-2">
                        <input
                          id={header.id}
                          type="text"
                          className="block w-full border-gray-300 rounded-md shadow-sm text-xs p-3"
                          placeholder={`Filter ${header.column.columnDef.header}`}
                          onChange={(e) =>
                            onFilterChange(header.column.id, e.target.value)
                          }
                        />
                      </TableCell>
                    )
                )}
              </TableRow>
            </React.Fragment>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="cursor-pointer">
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

const Index = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [employeeData, setEmployeeData] = useState<TakeLeave[]>([]);
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("Pending");
  const [selectedWorker, setSelectedWorker] = useState<TakeLeave | null>(null);

  const itemsPerPage = 5;

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/takeleave");
      const data = await response.json();
      const formattedData = data.map((row: any) => ({
        timestamp: row.Timestamp,
        emailAddress: row["Email address"],
        fullName: row["Full Name"],
        employeeID: row["Employee ID "],
        daysTotal: row["How many days in total?"],
        startDate: row["Leave Start Date"],
        endDate: row["Leave End Date"],
        reason: row["Reason"],
        status: row["Status"],
      }));
      setEmployeeData(formattedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (row: TakeLeave) => {
    try {
      const response = await fetch(`/api/approveTakeLeave`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: row.fullName,
          email: row.emailAddress,
          employeeID: row.employeeID,
          status: "Approved",
          startDate: row.startDate,
          endDate: row.endDate,
          leaveStatus: "On Leave",
        }),
      });
  
      if (response.ok) {
        // Re-fetch data from the server to update the table
        fetchData();
      } else {
        console.error("Failed to approve leave:", await response.json());
      }
    } catch (error) {
      console.error("Error approving leave:", error);
    }
  };
  
  const handleDelete = async (row: TakeLeave) => {
    try {
      const response = await fetch(`/api/approveTakeLeave`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeID: row.employeeID,
          status: "Rejected",
        }), // Include status in the request body
      });

      if (response.ok) {
        // Re-fetch data from the server to update the table
        fetchData();
      } else {
        console.error("Failed to approve leave:", await response.json());
      }
    } catch (error) {
      console.error("Error approving leave:", error);
    }
  };

  const filteredData = useMemo(() => {
    return employeeData.filter((employee) => {
      const matchesStatus =
        employee.status &&
        employee.status.toLowerCase() === activeTab.toLowerCase();
      const otherFilters = Object.entries(filters).every(([column, value]) => {
        const columnValue = (employee as any)[column] as string;
        return columnValue.toLowerCase().includes(value.toLowerCase());
      });
      return matchesStatus && otherFilters;
    });
  }, [employeeData, filters, activeTab]);

  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * itemsPerPage;
    const lastPageIndex = firstPageIndex + itemsPerPage;
    return filteredData.slice(firstPageIndex, lastPageIndex);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleRowClick = (worker: TakeLeave) => {
    setSelectedWorker(worker);
  };

  const handleFilterChange = (column: string, value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [column]: value,
    }));
    setCurrentPage(1); // Reset to the first page when filters change
  };

  return (
    <div>
      <Header Title="Take Leave Form Page"></Header>
      <div className="container mx-auto p-5">
        <h1 className="text-3xl font-bold mb-5 text-center">
          Take Leave Records
        </h1>

        <div className="container flex justify-center items-center p-5">
          <div className="flex space-x-3">
            <Card className="min-w-64">
              <CardHeader>
                <CardTitle className="text-center">
                  Total Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center font-mono text-5xl">
                  {employeeData.length}
                </p>
              </CardContent>
            </Card>

            <Card className="min-w-64">
              <CardHeader>
                <CardTitle className="text-center">New Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center font-mono text-5xl">
                  {getNewEmployeeCount(employeeData)}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div>
            <Tabs defaultValue="pending" className="pb-2">
              <TabsList>
                <TabsTrigger
                  value="pending"
                  onClick={() => setActiveTab("Pending")}
                >
                  Pending
                </TabsTrigger>

                <TabsTrigger
                  value="approved"
                  onClick={() => setActiveTab("Approved")}
                >
                  Approved
                </TabsTrigger>
                <TabsTrigger
                  value="rejected"
                  onClick={() => setActiveTab("Rejected")}
                >
                  Rejected
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <DataTable
              columns={getColumns(activeTab, handleApprove, handleDelete)}
              data={currentTableData}
              onRowClick={handleRowClick}
              onFilterChange={handleFilterChange}
              activeTab={activeTab}
            />
            <Pagination>
              <PaginationContent>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <Button>Previous</Button>
                </PaginationPrevious>
                <PaginationItem>{`Page ${currentPage} of ${totalPages}`}</PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  <Button>Next</Button>
                </PaginationNext>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
