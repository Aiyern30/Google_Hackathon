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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";

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
  status: string;
};


const columns: ColumnDef<Recruitment>[] = [
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
      const cvLink = info.getValue() as string;
      return (
        <Button>
          <a 
            href={cvLink} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()} 
          >
            View CV
          </a>
        </Button>
      );
    },
  }
  
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
  onRowClick,
  onFilterChange,
}: {
  columns: ColumnDef<TData>[];
  data: TData[];
  onRowClick: (row: TData) => void;
  onFilterChange: (column: string, value: string) => void;
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

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
                    {header.column.id === "cvLink" ? null : (
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
              <TableRow key={row.id} className="cursor-pointer" onClick={() => onRowClick(row.original)}>
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
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedRecruitment, setSelectedRecruitment] = useState<Recruitment | null>(null);
  const itemsPerPage = 5;

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const [salary, setSalary] = useState("");

  


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
          status: row["Status"],
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
      const statusFilter = selectedStatus === "All" || employee.status === selectedStatus;
      const otherFilters = Object.entries(filters).every(([column, value]) => {
        const columnValue = (employee as any)[column] as string;
        if (column === "cvLink") {
          return true;
        }
        return columnValue.toLowerCase().includes(value.toLowerCase());
      });
      return statusFilter && otherFilters;
    });
  }, [employeeData, filters, selectedStatus]);

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
    setCurrentPage(1);
  };

  const handleTabChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handleRowClick = (recruitment: Recruitment) => {
    setSelectedRecruitment(recruitment);
  };

  const handleApprove = () => {
    // Handle approve logic here
    if (selectedRecruitment) {
      // Perform the approval action
      console.log("Approved:", selectedRecruitment);
    }
    setSelectedRecruitment(null); // Close dialog
  };

  const handleReject = () => {
    // Handle reject logic here
    if (selectedRecruitment) {
      // Perform the rejection action
      console.log("Rejected:", selectedRecruitment);
    }
    setSelectedRecruitment(null); // Close dialog
  };

  return (
    <div>
      <Header Title="Recruitment Records" />
      <div className="container mx-auto p-5">
        <div className="container flex justify-center items-center p-5">
          <div className="flex space-x-3">
            <Card className="min-w-64">
              <CardHeader>
                <CardTitle className="text-center">Total Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl text-center">{employeeData.length}</div>
              </CardContent>
            </Card>
            <Card className="min-w-64">
              <CardHeader>
                <CardTitle className="text-center">New Employees</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl text-center">{getNewEmployeeCount(employeeData)}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex flex-col">
          <Tabs defaultValue="All" className="mb-4">
            <TabsList>
              <TabsTrigger value="All" onClick={() => handleTabChange("All")}>All</TabsTrigger>
              <TabsTrigger value="Approved" onClick={() => handleTabChange("Approved")}>Approved</TabsTrigger>
              <TabsTrigger value="Rejected" onClick={() => handleTabChange("Rejected")}>Rejected</TabsTrigger>
            </TabsList>
            <TabsContent value="All" />
          </Tabs>

          <DataTable
            columns={columns}
            data={currentTableData}
            onRowClick={handleRowClick}
            onFilterChange={handleFilterChange}
          />
<Pagination className="flex justify-center mt-4 list-none"> {/* Ensure `list-none` class is here */}
  <PaginationPrevious
    onClick={() => handlePageChange(currentPage - 1)}
    className={`px-4 py-2 mx-1 border rounded-md ${currentPage === 1 ? "hidden" : ""} hover:bg-gray-200 cursor-pointer`}
  >
    Previous
  </PaginationPrevious>

  {Array.from({ length: totalPages }, (_, index) => (
    <PaginationItem
      key={index}
      onClick={() => handlePageChange(index + 1)}
      className={`px-4 py-2 mx-1 border rounded-md cursor-pointer ${index + 1 === currentPage ? "bg-black text-white " : "hover:bg-gray-200"}`}
    >
      {index + 1}
    </PaginationItem>
  ))}

  <PaginationNext
    onClick={() => handlePageChange(currentPage + 1)}
    className={`px-4 py-2 mx-1 border rounded-md ${currentPage === totalPages ? "hidden" : ""} hover:bg-gray-200 cursor-pointer`}
  >
    Next
  </PaginationNext>
</Pagination>


        </div>

        <Dialog open={!!selectedRecruitment} onOpenChange={() => setSelectedRecruitment(null)}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Recruitment Details</DialogTitle>
    </DialogHeader>
    {selectedRecruitment && (
      <div>
        <p><strong>Email Address:</strong> {selectedRecruitment.emailAddress}</p>
        <p><strong>Full Name:</strong> {selectedRecruitment.fullName}</p>
        <p><strong>CV Link:</strong> <a href={selectedRecruitment.cvLink} target="_blank" rel="noopener noreferrer">View CV</a></p>

        {/* Tabs for Approve and Reject */}
        <Tabs defaultValue="approve" className="mt-4">
          <TabsList>
            <TabsTrigger value="approve">Approve</TabsTrigger>
            <TabsTrigger value="reject">Reject</TabsTrigger>
          </TabsList>
          <TabsContent value="approve">
            {/* Approve Content */}
            <div>
              <div className="mt-4">
                <label className="block mb-2" htmlFor="salary">Salary:</label>
                <input
                  type="number"
                  id="salary"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="w-full border rounded-md p-2"
                  placeholder="Enter proposed salary"
                />
              </div>
              <p>Approval Email Format:</p>
              <textarea 
                className="w-full border rounded-md p-2"
                rows={4}
                placeholder={`Dear ${selectedRecruitment.fullName},\n\nCongratulations! We are pleased to inform you that you have been approved for the position of ${selectedRecruitment.positionAppliedFor} with a proposed salary of ${salary}.\n\nBest regards,\nYour Company Name`}
              />
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={handleApprove} className="mr-2">Approve</Button>
              <Button onClick={() => setSelectedRecruitment(null)}>Cancel</Button>
            </div>
          </TabsContent>
          <TabsContent value="reject">
            {/* Reject Content */}
            <div>
              <p>Rejection Email Format:</p>
              <textarea 
                className="w-full border rounded-md p-2"
                rows={4}
                placeholder={`Dear ${selectedRecruitment.fullName},\n\nThank you for your application for the position of ${selectedRecruitment.positionAppliedFor}. Unfortunately, we are unable to move forward with your application at this time.\n\nBest regards,\nYour Company Name`}
              />
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={handleReject} className="mr-2">Reject</Button>
              <Button onClick={() => setSelectedRecruitment(null)}>Cancel</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    )}
  </DialogContent>
</Dialog>


      </div>
    </div>
  );
};

export default Index;


