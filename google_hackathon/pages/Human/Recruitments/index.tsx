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

type Recruitment = {
  timestamp: string;
  emailAddress: string;
  fullName: string;
  positionAppliedFor: string;
  departmentAppliedFor: string;
  phoneNumber: string;
  previousWorkExperience: string;
  skills: string;
  cvLink: string;
};

const columns: ColumnDef<Recruitment>[] = [
  // { accessorKey: "timestamp", header: "Timestamp" },
  { accessorKey: "emailAddress", header: "Email Address" },
  { accessorKey: "fullName", header: "Full Name" },
  { accessorKey: "positionAppliedFor", header: "Position Applied For" },
  { accessorKey: "departmentAppliedFor", header: "Department" },
  { accessorKey: "phoneNumber", header: "Phone Number" },
  { accessorKey: "previousWorkExperience", header: "Previous Work Experience" },
  { accessorKey: "skills", header: "Skills" },
  {
    accessorKey: "cvLink",
    header: "CV Link",
    cell: (info) => {
      const cvLink = info.getValue() as string; // Cast the value to string
      return (
        <a href={cvLink} target="_blank" rel="noopener noreferrer">
          View CV
        </a>
      );
    },
  },
];

const getNewEmployeeCount = (data: Recruitment[]) => {
  return data.filter((employee) => {
    const hireYear = new Date(employee.timestamp).getFullYear();
    return hireYear === 2024;
  }).length;
};

function DataTable<TData extends Recruitment>({
  columns,
  data,
  onFilterChange,
}: {
  columns: ColumnDef<TData>[];
  data: TData[];
  onFilterChange: (column: string, value: string) => void;
}) {
  const router = useRouter();
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleRowClick = (recruitmentId: string) => {
    router.push(`/Recruitment/${recruitmentId}`);
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
                {headerGroup.headers.map((header) => (
                  <TableCell key={header.id} className="p-2">
                    {header.column.id === "cvLink" ? null : ( // Skip filter for cvLink
                      <input
                        id={header.id}
                        type="text"
                        className="block w-full border-gray-300 rounded-md shadow-sm text-xs p-3"
                        placeholder={`Filter ${header.column.columnDef.header}`}
                        onChange={(e) =>
                          onFilterChange(header.column.id, e.target.value)
                        }
                      />
                    )}
                  </TableCell>
                ))}
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
  const [employeeData, setEmployeeData] = useState<Recruitment[]>([]);
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const itemsPerPage = 5;

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/recruitments");
        const data = await response.json();
        const formattedData = data.map((row: any) => ({
          timestamp: row.Timestamp,
          emailAddress: row["Email address"],
          fullName: row["Please enter your full name. "],
          positionAppliedFor: row["Position Applied For:  "],
          departmentAppliedFor: row["Department applied for"],
          phoneNumber: row["Write your phone number"],
          previousWorkExperience: row["Previous Work Experience"],
          skills: row["Skills you have"],
          cvLink: row["Attach your CV"],
        }));
        setEmployeeData(formattedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    return employeeData.filter((employee) => {
      return Object.entries(filters).every(([column, value]) => {
        const columnValue = (employee as any)[column] as string;
        // Skip filtering for 'cvLink'
        if (column === "cvLink") {
          return true; // Always return true for cvLink to exclude it from filtering
        }
        return columnValue.toLowerCase().includes(value.toLowerCase());
      });
    });
  }, [employeeData, filters]);

  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * itemsPerPage;
    const lastPageIndex = firstPageIndex + itemsPerPage;
    return filteredData.slice(firstPageIndex, lastPageIndex);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleFilterChange = (column: string, value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [column]: value,
    }));
    setCurrentPage(1); // Reset to the first page when filters change
  };

  return (
    <div>
      <Header Title="dd"></Header>
      <div className="container mx-auto p-5">
        <h1 className="text-3xl font-bold mb-5 text-center">
          Recruitment Records
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

            {/* <Card className="min-w-64">
              <CardHeader>
                <CardTitle className="text-center">
                  Pending Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center font-mono text-5xl">
                  {
                    employeeData.filter(
                      (employee) => employee.status === "Pending"
                    ).length
                  }
                </p>
              </CardContent>
            </Card> */}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div>
            <DataTable
              columns={columns}
              data={currentTableData}
              onFilterChange={handleFilterChange}
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
