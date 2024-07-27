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
  const [selectedRecruitment, setSelectedRecruitment] = useState<Recruitment | null>(null);
  const [salary, setSalary] = useState("");
  const [activeTab, setActiveTab] = useState<string>("pending"); // New state for active tab

  const itemsPerPage = 5;

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

  // Filter data based on the selected tab
  const filteredData = useMemo(() => {
    return employeeData.filter((employee) => {
      const matchesStatus = employee.status.toLowerCase() === activeTab.toLowerCase() || activeTab === 'all';
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

  const handleFilterChange = (column: string, value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [column]: value,
    }));
    setCurrentPage(1);
  };

  const handleRowClick = (recruitment: Recruitment) => {
    setSelectedRecruitment(recruitment);
  };

  const handleApprove = () => {
    if (selectedRecruitment) {
      console.log("Approved:", selectedRecruitment);
      setSelectedRecruitment(null); // Close dialog
    }
  };

  const handleReject = () => {
    if (selectedRecruitment) {
      console.log("Rejected:", selectedRecruitment);
      setSelectedRecruitment(null); // Close dialog
    }
  };

  const handleSetPending = () => {
    if (selectedRecruitment) {
      console.log("Changed to Pending:", selectedRecruitment);
      setSelectedRecruitment(null); // Close dialog
    }
  };

  const handleDialogClose = () => {
    setSelectedRecruitment(null); // Close dialog
    setSalary(""); // Reset salary input
  };

  return (
    <div>
      <Header Title="Recruitment Records" />
      <div className="container mx-auto p-5">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            <Tabs defaultValue="pending">
              <TabsList>
                <TabsTrigger value="pending" onClick={() => setActiveTab("Pending")}>Pending</TabsTrigger>
                <TabsTrigger value="in-progress" onClick={() => setActiveTab("In Progress")}>In Progress</TabsTrigger>
                <TabsTrigger value="approved" onClick={() => setActiveTab("Approved")}>Approved</TabsTrigger>
                <TabsTrigger value="rejected" onClick={() => setActiveTab("Rejected")}>Rejected</TabsTrigger>
              </TabsList>
            </Tabs>

            <DataTable
              columns={columns}
              data={currentTableData}
              onRowClick={handleRowClick}
              onFilterChange={handleFilterChange}
            />
            <Pagination className="flex justify-center mt-4 list-none">
              {currentPage > 1 && (
                <PaginationPrevious
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="px-4 py-2 mx-1 border rounded-md hover:bg-gray-200 cursor-pointer"
                >
                  Previous
                </PaginationPrevious>
              )}
              {Array.from({ length: totalPages }, (_, index) => (
                <PaginationItem
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-4 py-2 mx-1 border rounded-md cursor-pointer ${
                    index + 1 === currentPage ? "bg-black text-white" : "hover:bg-gray-200"
                  }`}
                >
                  {index + 1}
                </PaginationItem>
              ))}
              {currentPage < totalPages && (
                <PaginationNext
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="px-4 py-2 mx-1 border rounded-md hover:bg-gray-200 cursor-pointer"
                >
                  Next
                </PaginationNext>
              )}
            </Pagination>
          </>
        )}
      </div>

      {/* Dialog for Approving or Rejecting a Recruitment */}
<Dialog open={!!selectedRecruitment} onOpenChange={handleDialogClose}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>{selectedRecruitment?.fullName}</DialogTitle>
    </DialogHeader>
    <Tabs defaultValue={
      selectedRecruitment?.status === "Pending" ? "in-progress" :
      selectedRecruitment?.status === "In Progress" ? "approve" :
      selectedRecruitment?.status === "Rejected" ? "pending" : "approve" // Default to "approve" if none match
    }>
      {selectedRecruitment?.status === "Pending" && (
        <TabsList>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="reject">Reject</TabsTrigger>
        </TabsList>
      )}
      {selectedRecruitment?.status === "In Progress" && (
        <TabsList>
          <TabsTrigger value="approve">Approve</TabsTrigger>
          <TabsTrigger value="reject">Reject</TabsTrigger>
        </TabsList>
      )}
      {selectedRecruitment?.status === "Rejected" && (
        <TabsList>
          <TabsTrigger value="pending">Set to Pending</TabsTrigger>
        </TabsList>
      )}

      {/* In Progress Tab */}
      {selectedRecruitment?.status === "Pending" && (
        <TabsContent value="in-progress">
          <p>Request a meeting with the candidate.</p>
          <div className="flex justify-end mt-4">
            <Button onClick={() => console.log("Meeting requested")}>
              Request Meeting
            </Button>
          </div>
        </TabsContent>
      )}

      {/* Reject Tab for Pending */}
      {selectedRecruitment?.status === "Pending" && (
        <TabsContent value="reject">
          <p>Unfortunately, you have been rejected.</p>
          <div className="flex justify-end mt-4">
            <Button variant="destructive" onClick={handleReject}>
              Reject
            </Button>
          </div>
        </TabsContent>
      )}

      {/* Approve Tab for In Progress */}
      {selectedRecruitment?.status === "In Progress" && (
        <TabsContent value="approve">
          <p>Approve this recruitment.</p>
          <div className="flex justify-end mt-4">
            <Button onClick={handleApprove}>Approve</Button>
          </div>
        </TabsContent>
      )}

      {/* Reject Tab for In Progress */}
      {selectedRecruitment?.status === "In Progress" && (
        <TabsContent value="reject">
          <p>Reject this recruitment.</p>
          <div className="flex justify-end mt-4">
            <Button variant="destructive" onClick={handleReject}>
              Reject
            </Button>
          </div>
        </TabsContent>
      )}

      {/* Set to Pending Tab for Rejected */}
      {selectedRecruitment?.status === "Rejected" && (
        <TabsContent value="pending">
          <p>Set this recruitment back to pending.</p>
          <div className="flex justify-end mt-4">
            <Button onClick={handleSetPending}>Set to Pending</Button>
          </div>
        </TabsContent>
      )}
    </Tabs>
  </DialogContent>
</Dialog>

    </div>
  );
};

export default Index;