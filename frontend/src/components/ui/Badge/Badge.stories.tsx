import type { Meta, StoryObj } from "@storybook/react-vite";

import { Badge } from "./Badge";

// One story per visual state (docs/components.md). Presentational stories
// need no decorators — args are the whole setup.
const meta = {
  title: "ui/Badge",
  component: Badge,
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Draft: Story = { args: { children: "Draft" } };

export const Beta: Story = { args: { tone: "accent", children: "Beta" } };

export const Active: Story = { args: { tone: "ok", children: "Active" } };

export const Overdue: Story = { args: { tone: "danger", children: "Overdue" } };
