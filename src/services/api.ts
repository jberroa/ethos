import { Round, Room, ManagerFeedback, ActionItem, Hospital, User } from "../types";

export async function fetchRounds(hospitalId?: string): Promise<Round[]> {
  const url = hospitalId ? `/api/rounds?hospitalId=${hospitalId}` : "/api/rounds";
  const res = await fetch(url);
  return res.json();
}

export async function submitRound(round: Partial<Round>): Promise<{ id: number }> {
  const res = await fetch("/api/rounds", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(round),
  });
  return res.json();
}

export async function fetchBehavioralAnalytics(hospitalId?: string) {
  const url = hospitalId ? `/api/analytics/behavioral?hospitalId=${hospitalId}` : "/api/analytics/behavioral";
  const res = await fetch(url);
  return res.json();
}

export async function fetchRooms(hospitalId?: string): Promise<Room[]> {
  const url = hospitalId ? `/api/rooms?hospitalId=${hospitalId}` : "/api/rooms";
  const res = await fetch(url);
  return res.json();
}

export async function addRoom(room: Partial<Room>): Promise<{ id: number }> {
  const res = await fetch("/api/rooms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(room),
  });
  return res.json();
}

export async function deleteRoom(id: number): Promise<any> {
  const res = await fetch(`/api/rooms/${id}`, {
    method: "DELETE",
  });
  return res.json();
}

export async function fetchManagerFeedback(): Promise<ManagerFeedback[]> {
  const res = await fetch("/api/manager-feedback");
  return res.json();
}

export async function submitManagerFeedback(feedback: Partial<ManagerFeedback>): Promise<{ id: number }> {
  const res = await fetch("/api/manager-feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(feedback),
  });
  return res.json();
}

export async function fetchActionItems(): Promise<ActionItem[]> {
  const res = await fetch("/api/action-items");
  return res.json();
}

export async function addActionItem(item: Partial<ActionItem>): Promise<{ id: number }> {
  const res = await fetch("/api/action-items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
  return res.json();
}

export async function fetchManagers(): Promise<any[]> {
  const res = await fetch("/api/managers");
  return res.json();
}

export async function addManager(manager: any): Promise<any> {
  const res = await fetch("/api/managers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(manager),
  });
  return res.json();
}

export async function updateManager(id: string, data: any): Promise<any> {
  const res = await fetch(`/api/managers/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateManagerStatus(id: string, status: string): Promise<any> {
  const res = await fetch(`/api/managers/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return res.json();
}

export async function deleteManager(id: string): Promise<any> {
  const res = await fetch(`/api/managers/${id}`, {
    method: "DELETE",
  });
  return res.json();
}

export async function fetchHospitals(): Promise<Hospital[]> {
  const res = await fetch("/api/hospitals");
  return res.json();
}

export async function addHospital(hospital: Partial<Hospital>): Promise<{ id: string }> {
  const res = await fetch("/api/hospitals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(hospital),
  });
  return res.json();
}

export async function fetchUsers(): Promise<User[]> {
  const res = await fetch("/api/users");
  return res.json();
}

export async function addUser(user: Partial<User>): Promise<{ id: string }> {
  const res = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  return res.json();
}

export async function loginManager(employeeId: string): Promise<any> {
  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employeeId }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Login failed");
  }
  return res.json();
}
