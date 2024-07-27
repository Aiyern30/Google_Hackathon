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
  PaginationLink,
} from "@/components/ui/Pagination";
import { useRouter } from "next/router";
import Header from "@/components/ui/HR Components/Header";

type Employee = {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phoneNumber: string;
  hireDate: string;
  status: "On Leave" | "Active";
};

const columns: ColumnDef<Employee>[] = [
  { accessorKey: "id", header: "Employee ID" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "position", header: "Position" },
  { accessorKey: "department", header: "Department" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "phoneNumber", header: "Phone Number" },
  {
    accessorKey: "hireDate",
    header: "Hire Date",
    cell: (info) => {
      const date = new Date(info.getValue() as string);
      return date.toLocaleDateString();
    },
  },
  { accessorKey: "status", header: "Status" },
];

const getNewEmployeeCount = (data: Employee[]) => {
  return data.filter((employee) => {
    const hireYear = new Date(employee.hireDate).getFullYear();
    return hireYear === 2024;
  }).length;
};

function DataTable<TData extends Employee>({
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

  const handleRowClick = (employeeId: string) => {
    router.push(`/Human/${employeeId}`);
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
                ))}
              </TableRow>
            </React.Fragment>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                onClick={() => handleRowClick((row.original as Employee).id)}
                className="cursor-pointer"
              >
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
  const [employeeData, setEmployeeData] = useState<Employee[]>([]);
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<boolean>(true); // Add loading state
  const itemsPerPage = 5;

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/employees");
        const data = await response.json();
        const formattedData = data.map((row: any) => ({
          id: row[0],
          name: row[1],
          position: row[2],
          department: row[3],
          email: row[4],
          phoneNumber: row[5],
          hireDate: row[6],
          status: row[7],
        }));
        setEmployeeData(formattedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false); // Set loading to false after data is fetched
      }
    };

    fetchData();
  }, []);

  const applyFilters = (data: Employee[]) => {
    return data.filter((item) => {
      return Object.keys(filters).every((key) => {
        const filterValue = filters[key].toLowerCase();
        const cellValue =
          item[key as keyof Employee]?.toString().toLowerCase() || "";
        return cellValue.includes(filterValue);
      });
    });
  };

  const filteredData = useMemo(
    () => applyFilters(employeeData),
    [employeeData, filters]
  );
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(
    () =>
      filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      ),
    [filteredData, currentPage]
  );

  const handleFilterChange = (column: string, value: string) => {
    setFilters((prevFilters) => ({ ...prevFilters, [column]: value }));
  };

  // Get the count of new employees hired in 2024
  const newEmployeeCount = getNewEmployeeCount(employeeData);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="relative flex justify-center items-center">
          <div className="absolute animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-purple-500"></div>
          <img
            src="https://www.svgrepo.com/show/509001/avatar-thinking-9.svg"
            className="rounded-full h-28 w-28"
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header Title="Human Resource Home Page" />
      <div className="container flex justify-center items-center p-5">
        <div className="flex space-x-3">
          <Card className="min-w-64">
            <CardHeader>
              <CardTitle className="text-center">Total Employee</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center font-mono text-5xl">
                {employeeData.length}
              </p>
            </CardContent>
          </Card>

          <Card className="min-w-64">
            <CardHeader>
              <CardTitle className="text-center">New Employee</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center font-mono text-5xl">
                {newEmployeeCount}
              </p>
            </CardContent>
          </Card>

          <Card className="min-w-64">
            <CardHeader>
              <CardTitle className="text-center">Take Leave</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center font-mono text-5xl">
                {
                  employeeData.filter(
                    (employee) => employee.status === "On Leave"
                  ).length
                }
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="container mx-auto px-8 max-w-screen-xl lg:max-w-screen-xl xl:max-w-screen-xl 2xl:max-w-[1400px] p-5">
        <DataTable
          columns={columns}
          data={paginatedData}
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
            <PaginationNext onClick={() => handlePageChange(currentPage + 1)}>
              <Button>Next</Button>
            </PaginationNext>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default Index;
