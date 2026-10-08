import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Save, Upload, User, Phone, CreditCard, Briefcase, Calendar, DollarSign, Clock, CheckCircle2 } from "lucide-react";
import { PageHeader, Card, Button, SectionTitle } from "../../components/ui-kit.jsx";
import { departments } from "../../lib/mock-data.js";

export const Route = createFileRoute("/hr/employees/add")({ component: AddEmployeePage });

function AddEmployeePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [salaryType, setSalaryType] = useState("monthly");

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      navigate({ to: "/hr/employees" });
    }, 1500);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-6">
        <Link to="/hr/employees" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Employees
        </Link>
        <PageHeader 
          title="Add New Employee" 
          subtitle="Onboard a new team member to the factory workforce"
          actions={
            <Button onClick={handleSubmit} disabled={loading}>
              <Save className="h-4 w-4" /> {loading ? "Saving..." : "Save Employee"}
            </Button>
          }
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Photo Upload */}
          <div className="lg:col-span-1">
            <Card className="text-center p-8 sticky top-24">
              <SectionTitle title="Profile Photo" />
              <div className="relative group mx-auto h-32 w-32 mb-4">
                <div className="h-full w-full rounded-2xl bg-muted border-2 border-dashed border-border overflow-hidden flex items-center justify-center group-hover:border-primary/50 transition-colors">
                  {imagePreview ? (
                    <img src={imagePreview} className="h-full w-full object-cover" alt="Preview" />
                  ) : (
                    <User className="h-12 w-12 text-muted-foreground opacity-20" />
                  )}
                </div>
                <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity">
                  <Upload className="h-6 w-6 text-white" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              </div>
              <p className="text-xs text-muted-foreground">Upload a professional portrait. Recommended size 400x400px.</p>
            </Card>
          </div>

          {/* Right Column: Form Fields */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <SectionTitle title="Personal Information" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input required placeholder="e.g. Muhammad Ahmad" className="w-full h-11 pl-10 pr-4 rounded-xl bg-muted border border-transparent focus:border-ring outline-none text-sm transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input required type="tel" placeholder="+92 3XX XXXXXXX" className="w-full h-11 pl-10 pr-4 rounded-xl bg-muted border border-transparent focus:border-ring outline-none text-sm transition-all" />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">CNIC Number</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input required placeholder="XXXXX-XXXXXXX-X" className="w-full h-11 pl-10 pr-4 rounded-xl bg-muted border border-transparent focus:border-ring outline-none text-sm transition-all" />
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <SectionTitle title="Employment Details" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Department</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <select defaultValue="Production" className="w-full h-11 pl-10 pr-4 rounded-xl bg-muted border border-transparent focus:border-ring outline-none text-sm transition-all appearance-none">
                      {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Designation</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <select defaultValue="Labour" className="w-full h-11 pl-10 pr-4 rounded-xl bg-muted border border-transparent focus:border-ring outline-none text-sm transition-all appearance-none">
                      <option value="Labour">Labour</option>
                      <option value="Manager">Manager</option>
                      <option value="HR">HR</option>
                      <option value="Machine Operator">Machine Operator</option>
                      <option value="Floor Supervisor">Floor Supervisor</option>
                      <option value="Accountant">Accountant</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Joining Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input required type="date" className="w-full h-11 pl-10 pr-4 rounded-xl bg-muted border border-transparent focus:border-ring outline-none text-sm transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Salary Type</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <select value={salaryType} onChange={(e) => setSalaryType(e.target.value)} className="w-full h-11 pl-10 pr-4 rounded-xl bg-muted border border-transparent focus:border-ring outline-none text-sm transition-all appearance-none">
                      <option value="monthly">Fixed Monthly Salary</option>
                      <option value="perDay">Per Day Salary</option>
                    </select>
                  </div>
                </div>
                {salaryType === "monthly" ? (
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Monthly Salary (PKR)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input required type="number" placeholder="e.g. 65000" className="w-full h-11 pl-10 pr-4 rounded-xl bg-muted border border-transparent focus:border-ring outline-none text-sm transition-all" />
                    </div>
                    <p className="text-xs text-muted-foreground ml-1">Paid once per month as a fixed salary.</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Per Day Rate (PKR)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input required type="number" placeholder="e.g. 1500" className="w-full h-11 pl-10 pr-4 rounded-xl bg-muted border border-transparent focus:border-ring outline-none text-sm transition-all" />
                      </div>
                    </div>
                    <div className="md:col-span-2 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                        <div>
                          <div className="text-sm font-bold text-foreground">Payment Cycle</div>
                          <p className="text-xs text-muted-foreground mt-1">This employee is paid after every 15 working days based on attendance.</p>
                        </div>
                        <div className="inline-flex h-10 items-center justify-center rounded-xl bg-gradient-primary px-4 text-sm font-bold text-primary-foreground shadow-glow">
                          15 Days
                        </div>
                      </div>
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Shift Timing</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <select className="w-full h-11 pl-10 pr-4 rounded-xl bg-muted border border-transparent focus:border-ring outline-none text-sm transition-all appearance-none">
                      <option>Morning (09:00 - 18:00)</option>
                      <option>Evening (14:00 - 23:00)</option>
                      <option>Night (22:00 - 07:00)</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Employee Status</label>
                  <div className="relative">
                    <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <select className="w-full h-11 pl-10 pr-4 rounded-xl bg-muted border border-transparent focus:border-ring outline-none text-sm transition-all appearance-none">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate({ to: "/hr/employees" })}>Cancel</Button>
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4" /> {loading ? "Saving..." : "Create Employee Profile"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
