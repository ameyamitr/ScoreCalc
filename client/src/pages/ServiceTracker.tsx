import { useState } from "react";
import { useServiceTracker } from "@/hooks/use-service-tracker";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { HeartHandshake, Plus, Trash2, FileText, Calendar } from "lucide-react";
import { format } from "date-fns";

// Define the form schema
const serviceHoursSchema = z.object({
  organization: z.string().min(1, "Organization name is required"),
  description: z.string().min(1, "Description is required"),
  hours: z.number().min(0.5, "Hours must be at least 0.5").max(24, "Hours cannot exceed 24 per day"),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Valid date is required",
  }),
  supervisorName: z.string().optional(),
  supervisorEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  supervisorPhone: z.string().optional(),
});

type FormValues = z.infer<typeof serviceHoursSchema>;

const ServiceTracker = () => {
  // Use a default user ID of 1 for this demo
  const userId = 1;
  
  const { serviceHours, isLoading, addServiceHour, deleteServiceHour } = useServiceTracker(userId);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(serviceHoursSchema),
    defaultValues: {
      organization: "",
      description: "",
      hours: 1,
      date: new Date().toISOString().split("T")[0],
      supervisorName: "",
      supervisorEmail: "",
      supervisorPhone: ""
    }
  });
  
  const onSubmit = async (data: FormValues) => {
    try {
      await addServiceHour({
        userId,
        ...data,
        date: new Date(data.date)
      });
      setIsAddDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error("Failed to add service hours:", error);
    }
  };
  
  const confirmDelete = async () => {
    if (deleteId !== null) {
      await deleteServiceHour(deleteId);
      setDeleteId(null);
    }
  };
  
  const totalHours = serviceHours.reduce((sum, record) => sum + record.hours, 0);
  
  return (
    <div className="py-12 bg-neutral-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-neutral-900 mb-2">Community Service Tracker</h1>
              <p className="text-neutral-700">
                Log and track your community service hours for college applications and scholarships.
              </p>
            </div>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Hours
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold text-accent">{totalHours}</CardTitle>
                <CardDescription>Total Service Hours</CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold text-accent">{serviceHours.length}</CardTitle>
                <CardDescription>Service Activities</CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold text-accent">
                  {serviceHours.length > 0 ? (totalHours / serviceHours.length).toFixed(1) : 0}
                </CardTitle>
                <CardDescription>Average Hours Per Activity</CardDescription>
              </CardHeader>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Service History</CardTitle>
              <CardDescription>
                Record of all your community service activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center text-neutral-500">Loading service records...</div>
              ) : serviceHours.length === 0 ? (
                <div className="py-12 text-center">
                  <HeartHandshake className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">No service hours recorded yet</h3>
                  <p className="text-neutral-500 mb-4">Start tracking your community service by adding your first entry.</p>
                  <Button 
                    onClick={() => setIsAddDialogOpen(true)}
                    variant="outline"
                    className="border-accent text-accent hover:bg-accent/10"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Service Hours
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Organization</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Hours</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {serviceHours.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">
                            {format(new Date(record.date), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>{record.organization}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {record.description.substring(0, 50)}
                            {record.description.length > 50 ? "..." : ""}
                          </TableCell>
                          <TableCell className="text-right">{record.hours}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedRecord(record)}
                                title="View details"
                              >
                                <FileText className="h-4 w-4 text-neutral-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteId(record.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                title="Delete record"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Add Hours Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Service Hours</DialogTitle>
            <DialogDescription>
              Record your community service activity details below.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="organization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Local Food Bank" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hours</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.5" 
                          min="0.5" 
                          placeholder="e.g., 2.5" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                          <Input 
                            type="date" 
                            className="pl-9" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the service activity and your role" 
                        className="resize-none" 
                        rows={3} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="supervisorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supervisor Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Jane Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="supervisorEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supervisor Email (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., jane@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="supervisorPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supervisor Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., (555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-accent hover:bg-accent/90">
                  Save Hours
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this service record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* View Details Dialog */}
      <Dialog open={selectedRecord !== null} onOpenChange={(open) => !open && setSelectedRecord(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Service Details</DialogTitle>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-neutral-500">Organization</h4>
                <p className="text-neutral-900">{selectedRecord.organization}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-neutral-500">Date</h4>
                  <p className="text-neutral-900">{format(new Date(selectedRecord.date), "MMMM d, yyyy")}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-neutral-500">Hours</h4>
                  <p className="text-neutral-900">{selectedRecord.hours}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-neutral-500">Description</h4>
                <p className="text-neutral-900">{selectedRecord.description}</p>
              </div>
              
              {selectedRecord.supervisorName && (
                <div>
                  <h4 className="text-sm font-medium text-neutral-500">Supervisor</h4>
                  <p className="text-neutral-900">{selectedRecord.supervisorName}</p>
                  {selectedRecord.supervisorEmail && (
                    <p className="text-neutral-500 text-sm">{selectedRecord.supervisorEmail}</p>
                  )}
                  {selectedRecord.supervisorPhone && (
                    <p className="text-neutral-500 text-sm">{selectedRecord.supervisorPhone}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceTracker;
