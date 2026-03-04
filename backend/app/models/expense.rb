class Expense < ApplicationRecord
  belongs_to :category

  # Default ordering by expense date descending
  default_scope { order(date: :desc) }
end
