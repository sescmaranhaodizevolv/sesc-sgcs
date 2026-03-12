/**
 * DashboardCard - Card de métrica reutilizável para dashboards
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardCardProps {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ReactNode;
    iconBg: string;
}

export function DashboardCard({ title, value, subtitle, icon, iconBg }: DashboardCardProps) {
    return (
        <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-gray-600">{title}</CardTitle>
                    <div className={`p-2 rounded-lg ${iconBg}`}>{icon}</div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-1">
                    <p className="text-2xl text-black font-semibold">{value}</p>
                    <p className="text-sm text-gray-500">{subtitle}</p>
                </div>
            </CardContent>
        </Card>
    );
}
