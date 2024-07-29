import React, { useEffect, useMemo, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/Card";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { format } from "date-fns";

import { DatePickerDemo } from "@/components/ui/DatePickerDemo";

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
  status: "Pending" | "Approved" | "Rejected" | "In Progress";
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
  },
];

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
              <TableRow
                key={row.id}
                className="cursor-pointer"
                onClick={() => onRowClick(row.original)}
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
  const [employeeData, setEmployeeData] = useState<Recruitment[]>([]);
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRecruitment, setSelectedRecruitment] =
    useState<Recruitment | null>(null);
  const [salary, setSalary] = useState("");
  const [activeTab, setActiveTab] = useState<string>("pending");
  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };
  const itemsPerPage = 5;
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [time, setTime] = useState<string>(getCurrentTime());
  useEffect(() => {
    // Update the time state every minute to keep it current
    const interval = setInterval(() => {
      setTime(getCurrentTime());
    }, 60000);

    return () => clearInterval(interval); // Clean up the interval on component unmount
  }, []);
  const [message, setMessage] = useState<string>("");
  const [rejectMessage, setRejectMessage] = useState<string>("");
  const [approvedMessage, setApprovedMessage] = useState<string>("");

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTime(e.target.value);
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSalary(e.target.value);
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleRejectMessageChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setRejectMessage(e.target.value);
  };

  const handleApproveMessageChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setApprovedMessage(e.target.value);
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
      const matchesStatus =
        employee.status.toLowerCase() === activeTab.toLowerCase() ||
        activeTab === "all";
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
    setMessage(
      `Dear ${recruitment.fullName},\n\n\nYour regards,\nCompany Name`
    );
    setRejectMessage(
      `Dear ${recruitment.fullName},\n\n\nYour regards,\nCompany Name`
    );
    setApprovedMessage(
      `Dear ${recruitment.fullName},\n\n\nYour regards,\nCompany Name`
    );
  };

  const handleApprove = () => {
    if (selectedRecruitment) {
      console.log("Approved:", selectedRecruitment);
      setSelectedRecruitment(null); // Close dialog
    }
  };

  const handleRequestMeeting = async (recruitment: Recruitment) => {
    if (recruitment) {
      try {
        const response = await fetch('/api/handleRequestMeeting', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'requestMeeting',
            recruitment: {
              ...recruitment,
              date: format(selectedDate, 'yyyy-MM-dd'),
              time,
              message,
            },
          }),
        });
  
        const result = await response.json();
        if (response.ok) {
          console.log('Meeting requested for:', result);
        } else {
          console.error('Error requesting meeting:', result);
        }
      } catch (error) {
        console.error('Error requesting meeting:', error);
      } finally {
        setSelectedRecruitment(null);
        setMessage('');
        setTime('');
      }
    }
  };
  
  
  const handleApproveMeeting = async (recruitment: Recruitment) => {
    if (recruitment) {
      try {
        const response = await fetch('', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'approveMeeting',
            recruitment: {
              ...recruitment,
              date: format(selectedDate, 'yyyy-MM-dd'),
              time,
              message,
            },
          }),
        });
  
        const result = await response.json();
        if (response.ok) {
          console.log('Meeting approved for:', result);
        } else {
          console.error('Error approving meeting:', result);
        }
      } catch (error) {
        console.error('Error approving meeting:', error);
      } finally {
        setSelectedRecruitment(null);
        setMessage('');
        setTime('');
      }
    }
  };

  const handleReject = async (recruitment: Recruitment) => {
    if (recruitment) {
      try {
        const response = await fetch('', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'reject',
            recruitment,
            message: rejectMessage,
          }),
        });
  
        const result = await response.json();
        if (response.ok) {
          console.log('Rejected:', result);
        } else {
          console.error('Error rejecting:', result);
        }
      } catch (error) {
        console.error('Error rejecting:', error);
      } finally {
        setSelectedRecruitment(null);
        setRejectMessage('');
      }
    }
  };

  const handleSetPending = async () => {
  if (selectedRecruitment) {
    try {
      const response = await fetch('', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'setPending',
          recruitment: selectedRecruitment,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        console.log('Changed to Pending:', result);
      } else {
        console.error('Error setting to pending:', result);
      }
    } catch (error) {
      console.error('Error setting to pending:', error);
    } finally {
      setSelectedRecruitment(null);
    }
  }
};

  const handleDialogClose = () => {
    setSelectedRecruitment(null); // Close dialog
    setSalary(""); // Reset salary input
  };

  return (
    <div>
      <Header Title="Recruitment Records" />
      <div className="container flex justify-center items-center p-5">
        <div className="flex space-x-3">
          <Card className="min-w-64">
            <CardHeader>
              <CardTitle className="text-center">Total Pending</CardTitle>
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
          </Card>

          <Card className="min-w-64">
            <CardHeader>
              <CardTitle className="text-center">Total In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center font-mono text-5xl">
                {
                  employeeData.filter(
                    (employee) => employee.status === "In Progress"
                  ).length
                }
              </p>
            </CardContent>
          </Card>
          <Card className="min-w-64">
            <CardHeader>
              <CardTitle className="text-center">Total Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center font-mono text-5xl">
                {
                  employeeData.filter(
                    (employee) => employee.status === "Approved"
                  ).length
                }
              </p>
            </CardContent>
          </Card>
          <Card className="min-w-64">
            <CardHeader>
              <CardTitle className="text-center">Total Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center font-mono text-5xl">
                {
                  employeeData.filter(
                    (employee) => employee.status === "Rejected"
                  ).length
                }
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="container mx-auto p-5">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            <Tabs defaultValue="pending">
              <div className="flex">
                <TabsList>
                  <TabsTrigger
                    value="pending"
                    onClick={() => setActiveTab("Pending")}
                  >
                    Pending
                  </TabsTrigger>
                  <TabsTrigger
                    value="in-progress"
                    onClick={() => setActiveTab("In Progress")}
                  >
                    In Progress
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
                <Input
                  type="email"
                  id="email"
                  placeholder="Email"
                  className="min-w-96"
                />
              </div>
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
                    index + 1 === currentPage
                      ? "bg-black text-white"
                      : "hover:bg-gray-200"
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
            <DialogTitle>{selectedRecruitment?.fullName} </DialogTitle>
          </DialogHeader>
          <Tabs
            defaultValue={
              selectedRecruitment?.status === "Pending"
                ? "in-progress"
                : selectedRecruitment?.status === "In Progress"
                ? "approve"
                : selectedRecruitment?.status === "Rejected"
                ? "pending"
                : "Approve" // Default to "approve" if none match
            }
          >
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
                <Label htmlFor="date">Date</Label>
                <DatePickerDemo
                  onDateChange={handleDateChange}
                  selectedDate={selectedDate}
                />
                <Label htmlFor="time">Time</Label>
                <Input
                  type="time"
                  value={time}
                  onChange={handleTimeChange}
                  placeholder="Select time"
                />
                <Label htmlFor="message-2">Your Message</Label>
                <Textarea
                  id="message-2"
                  value={message}
                  onChange={handleMessageChange}
                  className="w-full min-h-32"
                />
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={() => handleRequestMeeting(selectedRecruitment)}
                  >
                    Request Meeting
                  </Button>
                </div>
              </TabsContent>
            )}

            {selectedRecruitment?.status === "Pending" && (
              <TabsContent value="reject">
                <Label htmlFor="message-reject">Your Message</Label>
                <Textarea
                  id="message-reject"
                  value={rejectMessage}
                  onChange={handleRejectMessageChange}
                  className="w-full min-h-32"
                />
                <div className="flex justify-end mt-4">
                  <Button onClick={() => handleReject(selectedRecruitment)}>
                    Reject
                  </Button>
                </div>
              </TabsContent>
            )}

            {/* Approve Tab for In Progress */}
            {selectedRecruitment?.status === "In Progress" && (
              <TabsContent value="approve">
                <Label htmlFor="salary">Salary</Label>
                <Input
                  type="number"
                  value={salary}
                  onChange={handleSalaryChange}
                  placeholder="Input salary"
                />

                <Label htmlFor="message-2">Your Message</Label>
                <Textarea
                  id="message-2"
                  value={approvedMessage}
                  onChange={handleApproveMessageChange}
                  className="w-full min-h-32"
                />
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={() => handleApproveMeeting(selectedRecruitment)}
                  >
                    Approve
                  </Button>
                </div>
              </TabsContent>
            )}

            {/* Reject Tab for In Progress */}
            {selectedRecruitment?.status === "In Progress" && (
              <TabsContent value="reject">
                <Label htmlFor="message-reject">Your Message</Label>
                <Textarea
                  id="message-reject"
                  value={rejectMessage}
                  onChange={handleRejectMessageChange}
                  className="w-full min-h-32"
                />
                <div className="flex justify-end mt-4">
                  <Button onClick={() => handleReject(selectedRecruitment)}>
                    Reject
                  </Button>
                </div>
              </TabsContent>
            )}

            {selectedRecruitment?.status === "Approved" && (
              <TabsContent value="Approve">
                <Card>
                  <div className="flex space-x-2">
                    <CardContent className="p-5">
                      <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          type="email"
                          id="email"
                          value={selectedRecruitment?.emailAddress || ""}
                          readOnly
                        />
                      </div>
                      <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          type="text"
                          id="fullName"
                          value={selectedRecruitment?.fullName || ""}
                          readOnly
                        />
                      </div>
                      <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="position">Position Applied For</Label>
                        <Input
                          type="text"
                          id="position"
                          value={selectedRecruitment?.positionAppliedFor || ""}
                          readOnly
                        />
                      </div>
                      <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="department">Department</Label>
                        <Input
                          type="text"
                          id="department"
                          value={
                            selectedRecruitment?.departmentAppliedFor || ""
                          }
                          readOnly
                        />
                      </div>
                    </CardContent>
                    <CardContent className="p-5">
                      <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                          type="text"
                          id="phoneNumber"
                          value={selectedRecruitment?.phoneNumber || ""}
                          readOnly
                        />
                      </div>
                      <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="experience">
                          Previous Work Experience
                        </Label>
                        <Input
                          type="text"
                          id="experience"
                          value={
                            selectedRecruitment?.previousWorkExperience || ""
                          }
                          readOnly
                        />
                      </div>
                      <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="skills">Skills</Label>
                        <Input
                          type="text"
                          id="skills"
                          value={selectedRecruitment?.skills || ""}
                          readOnly
                        />
                      </div>
                      <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="cvLink">CV Link</Label>
                        <Input
                          type="text"
                          id="cvLink"
                          value={selectedRecruitment?.cvLink || ""}
                          readOnly
                        />
                      </div>
                    </CardContent>
                  </div>
                </Card>

                <div className="flex justify-end mt-4">
                  <Button onClick={handleSetPending}>Set to Pending</Button>
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
