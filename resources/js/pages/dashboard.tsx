import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Button, Card, Typography, Space, Statistic, Dropdown, MenuProps, theme } from 'antd';
import { TeamOutlined, CarOutlined, UserOutlined, EnvironmentOutlined, AlertOutlined, DownloadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const { Title, Text } = Typography;
const { useToken } = theme;

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardProps {
    totalAdmins: number;
    totalVehicles: number;
    totalDrivers: number;
    totalBarangays: number;
    recentIncidents: {
        id: number;
        title: string;
        description: string;
        status: string;
        severity: string;
        created_at: string;
        barangay: {
            name: string;
        };
    }[];
    vehicles: {
        id: number;
        code: string;
        plate_number: string;
        brand: string;
        model: string;
        year: string;
        barangay: {
            name: string;
        };
    }[];
    drivers: {
        id: number;
        name: string;
        drivers_license_number: string;
        contact_number: string;
        barangay: {
            name: string;
        };
    }[];
}

export default function Dashboard({
    totalAdmins,
    totalVehicles,
    totalDrivers,
    totalBarangays,
    recentIncidents = [],
    vehicles = [],
    drivers = [],
}: DashboardProps) {
    const { token } = useToken();

    // Color palette
    const colors = {
        primary: token.colorPrimary,
        success: token.colorSuccess,
        warning: token.colorWarning,
        error: token.colorError,
        info: token.colorInfo,
        purple: '#722ed1',
        cyan: '#13c2c2',
        background: token.colorBgContainer,
        text: token.colorText,
        textSecondary: token.colorTextSecondary,
        border: token.colorBorder,
    };

    const exportToExcel = (data: any[], fileName: string) => {
        const wb = XLSX.utils.book_new();
        const wsData = data.map(item => {
            if (fileName === 'Incidents') {
                return {
                    'ID': item.id,
                    'Title': item.title,
                    'Description': item.description,
                    'Status': item.status.replace('_', ' ').toUpperCase(),
                    'Severity': item.severity.toUpperCase(),
                    'Barangay': item.barangay.name,
                    'Date': new Date(item.created_at).toLocaleDateString()
                };
            } else if (fileName === 'Vehicles') {
                return {
                    'ID': item.id,
                    'Code': item.code,
                    'Plate Number': item.plate_number,
                    'Brand': item.brand,
                    'Model': item.model,
                    'Year': item.year,
                    'Barangay': item.barangay.name
                };
            } else if (fileName === 'Drivers') {
                return {
                    'ID': item.id,
                    'Name': item.name,
                    'License Number': item.drivers_license_number,
                    'Contact Number': item.contact_number,
                    'Barangay': item.barangay.name
                };
            }
            return item;
        });

        const ws = XLSX.utils.json_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, fileName);

        if (!ws['!pageSetup']) ws['!pageSetup'] = {};
        ws['!pageSetup'].paperSize = 9;
        ws['!pageSetup'].orientation = 'landscape';
        ws['!pageSetup'].fitToPage = true;
        ws['!pageSetup'].fitToWidth = 1;
        ws['!pageSetup'].fitToHeight = 0;

        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `${fileName}_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const exportItems: MenuProps['items'] = [
        {
            key: 'incidents',
            label: 'Export Incidents',
            icon: <AlertOutlined />,
            onClick: () => exportToExcel(recentIncidents, 'Incidents')
        },
        {
            key: 'vehicles',
            label: 'Export Vehicles',
            icon: <CarOutlined />,
            onClick: () => exportToExcel(vehicles, 'Vehicles')
        },
        {
            key: 'drivers',
            label: 'Export Drivers',
            icon: <UserOutlined />,
            onClick: () => exportToExcel(drivers, 'Drivers')
        },
        {
            type: 'divider',
        },
        {
            key: 'all',
            label: 'Export All Data',
            icon: <DownloadOutlined />,
            onClick: () => {
                exportToExcel(recentIncidents, 'Incidents');
                exportToExcel(vehicles, 'Vehicles');
                exportToExcel(drivers, 'Drivers');
            }
        }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6" style={{ backgroundColor: colors.background }}>
                {/* Header with Export Button */}
                <div className="flex justify-between items-center">
                    <Title level={2} className="m-0" style={{ color: colors.text }}>
                        <span style={{ color: colors.primary }}>Barangay</span> Vehicle Monitoring
                    </Title>
                    <Dropdown menu={{ items: exportItems }} placement="bottomRight">
                        <Button
                            type="primary"
                            icon={<DownloadOutlined />}
                            style={{ backgroundColor: colors.primary }}
                        >
                            Export Data
                        </Button>
                    </Dropdown>
                </div>

                {/* Summary Cards */}
                <div className="grid auto-rows-min gap-6 md:grid-cols-4">
                    <Card
                        bordered={false}
                        className="shadow-md hover:shadow-lg transition-shadow"
                        style={{
                            backgroundColor: colors.primary + '10',
                            borderLeft: `4px solid ${colors.primary}`
                        }}
                    >
                        <Statistic
                            title={<span style={{ color: colors.text }}>Total Admins</span>}
                            value={totalAdmins}
                            prefix={<TeamOutlined style={{ color: colors.primary }} />}
                            valueStyle={{ color: colors.text }}
                        />
                    </Card>
                    <Card
                        bordered={false}
                        className="shadow-md hover:shadow-lg transition-shadow"
                        style={{
                            backgroundColor: colors.info + '10',
                            borderLeft: `4px solid ${colors.info}`
                        }}
                    >
                        <Statistic
                            title={<span style={{ color: colors.text }}>Total Vehicles</span>}
                            value={totalVehicles}
                            prefix={<CarOutlined style={{ color: colors.info }} />}
                            valueStyle={{ color: colors.text }}
                        />
                    </Card>
                    <Card
                        bordered={false}
                        className="shadow-md hover:shadow-lg transition-shadow"
                        style={{
                            backgroundColor: colors.success + '10',
                            borderLeft: `4px solid ${colors.success}`
                        }}
                    >
                        <Statistic
                            title={<span style={{ color: colors.text }}>Total Drivers</span>}
                            value={totalDrivers}
                            prefix={<UserOutlined style={{ color: colors.success }} />}
                            valueStyle={{ color: colors.text }}
                        />
                    </Card>
                    <Card
                        bordered={false}
                        className="shadow-md hover:shadow-lg transition-shadow"
                        style={{
                            backgroundColor: colors.warning + '10',
                            borderLeft: `4px solid ${colors.warning}`
                        }}
                    >
                        <Statistic
                            title={<span style={{ color: colors.text }}>Total Barangays</span>}
                            value={totalBarangays}
                            prefix={<EnvironmentOutlined style={{ color: colors.warning }} />}
                            valueStyle={{ color: colors.text }}
                        />
                    </Card>
                </div>

                {/* Recent Incidents */}
                <Card
                    title={
                        <div className="flex items-center gap-2">
                            <AlertOutlined style={{ color: colors.error, fontSize: '18px' }} />
                            <span style={{ color: colors.text }}>Recent Incident Reports</span>
                        </div>
                    }
                    bordered={false}
                    className="shadow-md flex-1"
                    style={{ backgroundColor: colors.background }}
                    extra={
                        <Button
                            icon={<DownloadOutlined />}
                            onClick={() => exportToExcel(recentIncidents, 'Incidents')}
                            style={{ color: colors.primary, borderColor: colors.primary }}
                        >
                            Export
                        </Button>
                    }
                >
                    <div className="h-full">
                        {recentIncidents.length > 0 ? (
                            <div className="space-y-4">
                                {recentIncidents.map((incident) => (
                                    <Card
                                        key={incident.id}
                                        className="hover:shadow-md transition-shadow"
                                        style={{
                                            backgroundColor: colors.background,
                                            borderLeft: `4px solid ${
                                                incident.severity === 'high' ? colors.error :
                                                incident.severity === 'medium' ? colors.warning :
                                                colors.success
                                            }`
                                        }}
                                    >
                                        <Space direction="vertical" size={4}>
                                            <Text strong style={{ color: colors.text, fontSize: '16px' }}>
                                                {incident.title}
                                            </Text>
                                            <Text type="secondary" style={{ color: colors.textSecondary }}>
                                                {incident.barangay.name}
                                            </Text>
                                            <Space>
                                                <span
                                                    className="px-2 py-1 text-xs rounded-md font-medium"
                                                    style={{
                                                        backgroundColor:
                                                            incident.status === 'pending' ? colors.warning + '20' :
                                                            incident.status === 'in_progress' ? colors.info + '20' :
                                                            incident.status === 'resolved' ? colors.success + '20' :
                                                            colors.textSecondary + '20',
                                                        color:
                                                            incident.status === 'pending' ? colors.warning :
                                                            incident.status === 'in_progress' ? colors.info :
                                                            incident.status === 'resolved' ? colors.success :
                                                            colors.textSecondary,
                                                    }}
                                                >
                                                    {incident.status.replace('_', ' ').toUpperCase()}
                                                </span>
                                                <span
                                                    className="px-2 py-1 text-xs rounded-md font-medium"
                                                    style={{
                                                        backgroundColor:
                                                            incident.severity === 'high' ? colors.error + '20' :
                                                            incident.severity === 'medium' ? colors.warning + '20' :
                                                            colors.success + '20',
                                                        color:
                                                            incident.severity === 'high' ? colors.error :
                                                            incident.severity === 'medium' ? colors.warning :
                                                            colors.success,
                                                    }}
                                                >
                                                    {incident.severity.toUpperCase()}
                                                </span>
                                            </Space>
                                            <Text type="secondary" className="text-xs" style={{ color: colors.textSecondary }}>
                                                {new Date(incident.created_at).toLocaleDateString()}
                                            </Text>
                                        </Space>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="flex h-full items-center justify-center relative">
                                <PlaceholderPattern className="absolute inset-0 size-full"
                                    style={{ stroke: token.colorBorderSecondary }}
                                />
                                <Text type="secondary" style={{ color: colors.textSecondary }}>
                                    No recent incidents
                                </Text>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
