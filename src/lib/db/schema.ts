import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const transactionTypeEnum = pgEnum("transaction_type", [
  "income",
  "expense",
  "transfer",
]);

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  currency: text("currency").notNull().default("IDR"),
  openingBalance: integer("opening_balance").notNull().default(0),
  icon: text("icon"),
  color: text("color"),
  isArchived: boolean("is_archived").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  icon: text("icon"),
  color: text("color"),
  parentId: uuid("parent_id"),
  isArchived: boolean("is_archived").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  type: transactionTypeEnum("type").notNull(),
  amount: integer("amount").notNull(),
  accountId: uuid("account_id").notNull(),
  toAccountId: uuid("to_account_id"),
  categoryId: uuid("category_id"),
  note: text("note"),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
  recurringRuleId: uuid("recurring_rule_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const budgets = pgTable("budgets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  categoryId: uuid("category_id").notNull(),
  amount: integer("amount").notNull(),
  period: text("period").notNull().default("monthly"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const userSettings = pgTable("user_settings", {
  userId: uuid("user_id").primaryKey(),
  defaultPayday: integer("default_payday").notNull().default(25),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const paydayOverrides = pgTable("payday_overrides", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  year: integer("year").notNull(),
  month: integer("month").notNull(),
  payday: integer("payday").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const recurringRules = pgTable("recurring_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  type: transactionTypeEnum("type").notNull(),
  amount: integer("amount").notNull(),
  accountId: uuid("account_id").notNull(),
  categoryId: uuid("category_id"),
  note: text("note"),
  frequency: text("frequency").notNull(),
  nextDueAt: timestamp("next_due_at", { withTimezone: true }).notNull(),
  lastMaterializedAt: timestamp("last_materialized_at", { withTimezone: true }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const accountsRelations = relations(accounts, ({ many }) => ({
  transactions: many(transactions),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
  children: many(categories),
  transactions: many(transactions),
  budgets: many(budgets),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id],
  }),
  toAccount: one(accounts, {
    fields: [transactions.toAccountId],
    references: [accounts.id],
  }),
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
}));
