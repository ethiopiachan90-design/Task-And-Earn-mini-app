import type { FastifyInstance } from 'fastify';

export async function adminRoutes(app: FastifyInstance) {
  // Admin routes — to be implemented in Phase 6
  // GET   /api/admin/dashboard             — Stats overview
  // GET   /api/admin/users                 — User list
  // PATCH /api/admin/users/:id             — Ban/freeze/adjust
  // POST  /api/admin/users/:id/adjust-balance — Manual balance adjustment
  // GET   /api/admin/tasks/pending          — Tasks needing approval
  // PATCH /api/admin/tasks/:id              — Approve/reject task
  // GET   /api/admin/withdrawals            — Pending withdrawals
  // PATCH /api/admin/withdrawals/:id        — Approve/reject withdrawal
  // GET   /api/admin/audit-logs             — Audit trail
}
