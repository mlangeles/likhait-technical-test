import React, { useState, useEffect } from "react";
import { ExpenseFormData } from "../types";
import { TextField, SelectBox, Button } from "../vibes";
import { useExpenseForm } from "../hooks/useExpenseForm";
import { formatDate } from "../utils/expenseUtils";

interface ExpenseFormProps {
  initialData?: Partial<ExpenseFormData>;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function ExpenseForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Add Expense",
}: ExpenseFormProps) {
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  
  const { formData, errors, isSubmitting, handleChange, handleSubmit } =
    useExpenseForm({ initialData, onSubmit });

  // Fetch categories from backend on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://127.0.0.1:3000/api/categories");
        const data = await res.json();
        setCategories(data.map((c: any) => c.name));
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);

  const formStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  };

  const buttonGroupStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.5rem",
    marginTop: "0.5rem",
  };

  const categoryOptions = categories.map((category) => ({
    value: category,
    label: category,
  }));

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    setIsAddingCategory(true);
    try {
      const response = await fetch("http://127.0.0.1:3000/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: { name: newCategoryName.trim() } }),
      });

      if (!response.ok) throw new Error("Failed to add category");

      const createdCategory = await response.json();
      // Update category list and auto-select
      setCategories([...categories, createdCategory.name]);
      handleChange("category", createdCategory.name);

      setNewCategoryName("");
      setShowAddCategoryModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to add category. Try again.");
    } finally {
      setIsAddingCategory(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <TextField
        label="Amount"
        type="number"
        step="0.01"
        placeholder="0.00"
        value={formData.amount}
        onChange={(e) => handleChange("amount", e.target.value)}
        error={errors.amount}
        fullWidth
        required
      />

      <TextField
        label="Description"
        type="text"
        placeholder="Enter description"
        value={formData.description}
        onChange={(e) => handleChange("description", e.target.value)}
        error={errors.description}
        fullWidth
        required
      />

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <SelectBox
          label="Category"
          options={categoryOptions}
          value={formData.category}
          onChange={(e) => handleChange("category", e.target.value)}
          error={errors.category}
          fullWidth
          required
        />
        <Button
          type="button"
          variant="secondary"
          onClick={() => setShowAddCategoryModal(true)}
        >
          Add Category
        </Button>
      </div>

      <TextField
        label="Date"
        type="date"
        value={formData.date}
        max={formatDate(new Date())} //Prevents selecting a future date for an expense
        onChange={(e) => handleChange("date", e.target.value)}
        error={errors.date}
        fullWidth
        required
      />

      <div style={buttonGroupStyle}>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          fullWidth
        >
          {isSubmitting ? "Submitting..." : submitLabel}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
      </div>

      {showAddCategoryModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "2rem",
              borderRadius: "8px",
              minWidth: "300px",
            }}
          >
            <h3>Add New Category</h3>
            <TextField
              label="Category Name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              fullWidth
              required
            />
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
              <Button
                type="button"
                onClick={handleAddCategory}
                disabled={isAddingCategory}
              >
                {isAddingCategory ? "Adding..." : "Add"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowAddCategoryModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}