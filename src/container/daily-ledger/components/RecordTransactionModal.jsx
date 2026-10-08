import React, { useState, useEffect } from "react";
import {
  X,
  ArrowDownLeft,
  ArrowUpRight,
  DollarSign,
  Calendar,
  Clock,
  Tag,
  CreditCard,
  User,
  Hash,
  FileText,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  useCreateLedgerTransactionMutation,
  useCreateIncomingTransactionMutation,
  useCreateOutgoingTransactionMutation,
  useUpdateLedgerTransactionMutation,
  useGetDailyLedgerChoicesQuery,
} from "../../../store/index.js";
import {
  InputField,
  SelectField,
  TextareaField,
} from "../../../common/sharefield/index.js";

const getTodayDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getCurrentTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

export function RecordTransactionModal({
  open,
  onClose,
  initialType = "INCOMING",
  selectedDate,
  editTransaction = null,
  onSuccess,
}) {
  const isEdit = Boolean(editTransaction);
  const [transactionType, setTransactionType] = useState(initialType);
  const [transactionDate, setTransactionDate] = useState(getTodayDate());
  const [transactionTime, setTransactionTime] = useState(getCurrentTime());
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [partyName, setPartyName] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");

  const { data: choicesData } = useGetDailyLedgerChoicesQuery();
  const [createTransaction, { isLoading: isCreatingGeneral }] =
    useCreateLedgerTransactionMutation();
  const [createIncoming, { isLoading: isCreatingIncoming }] =
    useCreateIncomingTransactionMutation();
  const [createOutgoing, { isLoading: isCreatingOutgoing }] =
    useCreateOutgoingTransactionMutation();
  const [updateTransaction, { isLoading: isUpdating }] =
    useUpdateLedgerTransactionMutation();

  const isSubmitting =
    isCreatingGeneral ||
    isCreatingIncoming ||
    isCreatingOutgoing ||
    isUpdating;

  const incomingCategories = choicesData?.incomingCategories || [
    "Fabric Sale",
    "Yarn Sale",
    "Product Sale",
    "Customer Payment",
    "Other Income",
    "Other Incoming",
  ];

  const outgoingCategories = choicesData?.outgoingCategories || [
    "Employee Salary",
    "Yarn Purchase",
    "Fabric Purchase",
    "Loan Payment",
    "Asset Purchase",
    "Utility Bill",
    "Transport",
    "Maintenance",
    "Supplier Payment",
    "Other Expense",
    "Other Outgoing",
  ];

  const paymentMethods = choicesData?.paymentMethods || [
    { value: "Cash", label: "Cash" },
    { value: "Bank Transfer", label: "Bank Transfer" },
    { value: "Cheque", label: "Cheque" },
    { value: "Online / UPI", label: "Online / UPI" },
    { value: "Other", label: "Other" },
  ];

  useEffect(() => {
    if (editTransaction) {
      setTransactionType(
        editTransaction.transaction_type ||
        editTransaction.transactionType ||
        "INCOMING"
      );
      setTransactionDate(
        editTransaction.transaction_date ||
        editTransaction.transactionDate ||
        getTodayDate()
      );
      setTransactionTime(
        editTransaction.created_at
          ? new Date(editTransaction.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          : (editTransaction.transaction_time || getCurrentTime())
      );
      setCategory(editTransaction.category || "");
      setAmount(String(editTransaction.amount || ""));
      setPaymentMethod(
        editTransaction.payment_method ||
        editTransaction.paymentMethod ||
        "Cash"
      );
      setPartyName(
        editTransaction.party_name || editTransaction.partyName || ""
      );
      setReferenceNumber(
        editTransaction.reference_number ||
        editTransaction.referenceNumber ||
        ""
      );
      setDescription(editTransaction.description || "");
      setNotes(editTransaction.notes || "");
    } else {
      setTransactionType(initialType);
      setTransactionDate(getTodayDate());
      setTransactionTime(getCurrentTime());
      setCategory(
        initialType === "INCOMING"
          ? incomingCategories[0] || ""
          : outgoingCategories[0] || ""
      );
      setAmount("");
      setPaymentMethod("Cash");
      setPartyName("");
      setReferenceNumber("");
      setDescription("");
      setNotes("");
    }
  }, [editTransaction, initialType, open]);

  // Set default category when type switches
  const handleTypeChange = (newType) => {
    setTransactionType(newType);
    if (!isEdit) {
      setCategory(
        newType === "INCOMING"
          ? incomingCategories[0] || ""
          : outgoingCategories[0] || ""
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid amount greater than 0");
      return;
    }

    if (!category.trim()) {
      toast.error("Please select or enter a category");
      return;
    }

    const payload = {
      transaction_type: transactionType,
      transaction_date: transactionDate,
      category: category.trim(),
      amount: numAmount.toFixed(2),
      payment_method: paymentMethod,
      party_name: partyName.trim(),
      reference_number: referenceNumber.trim(),
      description: description.trim(),
      notes: notes.trim(),
    };

    try {
      if (isEdit) {
        await updateTransaction({
          id: editTransaction.id,
          ...payload,
        }).unwrap();
        toast.success("Transaction updated successfully");
      } else {
        if (transactionType === "INCOMING") {
          await createIncoming(payload).unwrap();
        } else {
          await createOutgoing(payload).unwrap();
        }
        toast.success(
          `${
            transactionType === "INCOMING" ? "Income / Sale" : "Expense / Purchase"
          } recorded successfully`
        );
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch {
      // Handled by global toast error handler in apiSlice
    }
  };

  if (!open) return null;

  const currentCategories =
    transactionType === "INCOMING" ? incomingCategories : outgoingCategories;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-card border border-border rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh]">
        {/* Modal Header with vibrant accent */}
        <div
          className={`p-3.5 sm:p-5 border-b border-border flex items-center justify-between gap-2 shrink-0 ${
            transactionType === "INCOMING"
              ? "bg-emerald-500/10 dark:bg-emerald-950/30"
              : "bg-rose-500/10 dark:bg-rose-950/30"
          }`}
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div
              className={`h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl flex items-center justify-center text-white shadow-md shrink-0 ${
                transactionType === "INCOMING"
                  ? "bg-emerald-600"
                  : "bg-rose-600"
              }`}
            >
              {transactionType === "INCOMING" ? (
                <ArrowDownLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-bold text-foreground truncate">
                {isEdit
                  ? "Edit Transaction"
                  : transactionType === "INCOMING"
                  ? "Record Income / Sale"
                  : "Record Expense / Purchase"}
              </h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                Operational Cash & Bank Movement
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 sm:p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
            title="Close modal"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-3.5 sm:p-5 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
          {/* Type Toggle (Only if not editing) */}
          {!isEdit && (
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-muted/60 rounded-xl border border-border/60">
              <button
                type="button"
                onClick={() => handleTypeChange("INCOMING")}
                className={`py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1 sm:gap-1.5 transition-all text-center ${
                  transactionType === "INCOMING"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ArrowDownLeft className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Income / Sale (+)</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange("OUTGOING")}
                className={`py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1 sm:gap-1.5 transition-all text-center ${
                  transactionType === "OUTGOING"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Expense / Debit (-)</span>
              </button>
            </div>
          )}

          {/* Amount, Date & Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            <InputField
              label="Amount (PKR)"
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              prefix="Rs"
            />

            <InputField
              label="Date"
              type="date"
              required
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              icon={Calendar}
            />

            <InputField
              label="Time"
              type="time"
              value={transactionTime}
              onChange={(e) => setTransactionTime(e.target.value)}
              icon={Clock}
            />
          </div>

          {/* Category selection */}
          <div className="space-y-1.5">
            <SelectField
              label="Category"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={currentCategories.map((cat) => ({
                value: cat,
                label: cat,
              }))}
              placeholder="-- Select Category --"
            />

            {/* Quick Category Pills */}
            <div className="flex flex-wrap gap-1 sm:gap-1.5 pt-0.5">
              {currentCategories.slice(0, 4).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-md border transition-colors ${
                    category === cat
                      ? "bg-primary/15 text-primary border-primary/40 font-medium"
                      : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method & Party */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <SelectField
              label="Payment Method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              options={paymentMethods}
            />

            <InputField
              label="Party / Customer / Vendor"
              placeholder="e.g. Master Fabrics, Bilal Traders..."
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              icon={User}
            />
          </div>

          {/* Reference # */}
          <InputField
            label="Reference / Invoice / Cheque #"
            placeholder="e.g. INV-1049, CHQ-88219..."
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            icon={Hash}
          />

          {/* Description */}
          <TextareaField
            label="Description / Particulars"
            rows={2}
            placeholder="Details of the sale, fabric quantity, invoice items, expense reason..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Internal Notes */}
          <TextareaField
            label="Internal Notes"
            rows={2}
            placeholder="Optional internal remarks..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          {/* Modal Footer */}
          <div className="pt-3 sm:pt-4 border-t border-border flex items-center justify-end gap-2 flex-wrap sm:flex-nowrap">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-2 sm:px-4 sm:py-2 rounded-xl border border-border text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex-1 sm:flex-initial"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 sm:px-5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-md transition-all flex items-center justify-center gap-1.5 sm:gap-2 flex-1 sm:flex-initial ${
                transactionType === "INCOMING"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Recording...
                </>
              ) : isEdit ? (
                "Save Changes"
              ) : transactionType === "INCOMING" ? (
                "Record Income (+)"
              ) : (
                "Record Expense (-)"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
