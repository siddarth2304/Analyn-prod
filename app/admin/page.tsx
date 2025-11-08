// File: app/admin/page.tsx

// This is now a Server Component!
import { sql } from "@vercel/postgres";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminApprovalButtons } from "@/components/admin-approval-buttons"; // We will create this

type Therapist = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  specialties: string; // JSON string
  hourly_rate: string;
  location: string;
};

// This function now runs on the SERVER, secured by your middleware
async function getPendingTherapists() {
  const result = await sql`
    SELECT t.id, t.hourly_rate, t.location, t.specialties,
           u.first_name, u.last_name, u.email
    FROM therapists t
    JOIN users u ON t.user_id = u.id
    WHERE t.is_verified = false
    ORDER BY t.created_at DESC;
  `;
  return result.rows as Therapist[];
}

export default async function AdminPage() {
  // We fetch data directly. No 'useEffect', 'useState', or 'loading'
  // Your middleware protects this page, so we know we are an admin here.
  const pending = await getPendingTherapists();

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 text-stone-700 py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-stone-800">Admin · Therapist Approvals</h1>

        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-stone-800">
              Pending Therapists
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">{pending.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pending.length === 0 ? (
              <p className="text-stone-500">No pending therapists.</p>
            ) : (
              <ul className="space-y-4">
                {pending.map((t) => {
                  let specialties: string[] = [];
                  try {
                    specialties = JSON.parse(t.specialties || "[]");
                  } catch (e) {}

                  return (
                    <li key={t.id} className="border rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between">
                      <div className="flex-1 mb-4 md:mb-0">
                        <div className="font-medium text-lg text-stone-800">
                          {t.first_name} {t.last_name}
                        </div>
                        <div className="text-sm text-stone-500">{t.email}</div>
                        {t.location && <div className="text-sm text-stone-600">{t.location} • ₹{t.hourly_rate}</div>}
                        
                        {specialties.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {specialties.map(spec => (
                              <Badge key={spec} className="bg-emerald-100 text-emerald-800">{spec}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      {/* We move the buttons to a Client Component */}
                      <AdminApprovalButtons therapistId={t.id} />
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}