import { User } from "./user";

export enum Priority {
  P1 = "P1",
  P2 = "P2",
  P3 = "P3",
  P4 = "P4",
  P5 = "P5",
}

export enum Status {
  Open = "Open",
  InProgress = "In Progress",
  InVerification = "In Verification",
  Close = "Closed",
}

export type Task = {
  id?: string;
  name: string;
  due: string;
  priority: Priority;
  status: Status;
  assignee: string;
  reporter: string;
};
