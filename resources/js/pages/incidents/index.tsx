import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Select, Tag, Image } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, InfoCircleOutlined, FilterOutlined } from '@ant-design/icons';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';

interface Incident {
    id: number;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'resolved' | 'closed';
    severity: 'low' | 'medium' | 'high' | 'critical';
    creator: string;
    image_path: string | null;
    latitude: number;
    longitude: number;
    barangay_id: number;
    barangay?: {
        id: number;
        name: string;
    };
}

interface Barangay {
    id: number;
    name: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Incidents',
        href: '/incident-reports',
    }
];

const GOOGLE_MAPS_API_KEY = 'AIzaSyC_WZ0T_FCfAV_G1yfuBGozFa2zOX9l82c';
const DEFAULT_CENTER = { lat: 15.9061, lng: 120.5853 }; // Villasis coordinates

export default function Incidents() {
    const { props } = usePage();
    const [incidents, setIncidents] = useState<Incident[]>(props.incidents || []);
    const [barangays, setBarangays] = useState<Barangay[]>(props.barangays || []);
    const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>(props.incidents || []);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState<number | null>(null);
    const [selectedPosition, setSelectedPosition] = useState(DEFAULT_CENTER);
    const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
    const [filters, setFilters] = useState({
        barangay: null as number | null,
        status: null as string | null,
    });

    useEffect(() => {
        setIncidents(props.incidents || []);
        setFilteredIncidents(props.incidents || []);
        setBarangays(props.barangays || []);
    }, [props.incidents, props.barangays]);

    useEffect(() => {
        let filtered = [...incidents];

        if (filters.barangay) {
            filtered = filtered.filter(incident => incident.barangay_id === filters.barangay);
        }

        if (filters.status) {
            filtered = filtered.filter(incident => incident.status === filters.status);
        }

        setFilteredIncidents(filtered);
    }, [filters, incidents]);

    const statusColors: Record<string, string> = {
        pending: 'orange',
        in_progress: 'blue',
        resolved: 'green',
        closed: 'gray',
    };

    const severityColors: Record<string, string> = {
        low: 'green',
        medium: 'blue',
        high: 'orange',
        critical: 'red',
    };

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Barangay',
            dataIndex: ['barangay', 'name'],
            key: 'barangay',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={statusColors[status]}>
                    {status.replace('_', ' ').toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Severity',
            dataIndex: 'severity',
            key: 'severity',
            render: (severity: string) => (
                <Tag color={severityColors[severity]}>
                    {severity.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Creator',
            dataIndex: 'creator',
            key: 'creator',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record: Incident) => (
                <Space>
                    <Button
                        icon={<InfoCircleOutlined />}
                        onClick={() => router.visit(`/incident-reports/${record.id}`)}
                    />
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    />
                    <Button
                        icon={<DeleteOutlined />}
                        danger
                        onClick={() => handleDelete(record.id)}
                    />
                </Space>
            ),
        },
    ];

    const handleEdit = (record: Incident) => {
        setEditingId(record.id);
        form.setFieldsValue(record);
        setSelectedPosition({ lat: Number(record.latitude), lng: Number(record.longitude) });
        setIsModalVisible(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await router.delete(`/incident-reports/${id}`, {
                preserveState: true,
                preserveScroll: true
            });
            message.success('Incident deleted successfully');
        } catch (error) {
            message.error('Failed to delete incident');
        }
    };

    const handleMapClick = (event: google.maps.MapMouseEvent) => {
        const lat = event.latLng?.lat();
        const lng = event.latLng?.lng();
        if (lat && lng) {
            setSelectedPosition({ lat: Number(lat), lng: Number(lng) });
            form.setFieldsValue({
                latitude: lat,
                longitude: lng
            });
        }
    };

    const handleSubmit = async (values: any) => {
        try {
            if (editingId) {
                await router.put(`/incident-reports/${editingId}`, values, {
                    preserveState: true,
                    preserveScroll: true
                });
            } else {
                await router.post('/incident-reports', values, {
                    preserveState: true,
                    preserveScroll: true
                });
            }
            message.success(`Incident ${editingId ? 'updated' : 'created'} successfully`);
            setIsModalVisible(false);
            form.resetFields();
            setEditingId(null);
            setSelectedPosition(DEFAULT_CENTER);
        } catch (error) {
            message.error(`Failed to ${editingId ? 'update' : 'create'} incident`);
        }
    };

    const handleFilterSubmit = (values: any) => {
        setFilters({
            barangay: values.barangay || null,
            status: values.status || null,
        });
        setIsFilterModalVisible(false);
    };

    const resetFilters = () => {
        setFilters({
            barangay: null,
            status: null,
        });
        form.resetFields(['barangay', 'status']);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Incidents Management" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex justify-between mb-4">
                    <h1 className="text-2xl font-bold">Incidents Management</h1>
                    <Space>
                        <Button
                            icon={<FilterOutlined />}
                            onClick={() => setIsFilterModalVisible(true)}
                        >
                            Filters
                        </Button>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                setEditingId(null);
                                form.resetFields();
                                setSelectedPosition(DEFAULT_CENTER);
                                setIsModalVisible(true);
                            }}
                        >
                            Add Incident
                        </Button>
                    </Space>
                </div>

                <div className="border rounded-xl p-4">
                    <Table
                        columns={columns}
                        dataSource={filteredIncidents}
                        rowKey="id"
                        onRow={(record) => ({
                            onClick: () => {
                                setMapCenter({ lat: Number(record.latitude), lng: Number(record.longitude) });
                            }
                        })}
                    />
                </div>

                <div className="border rounded-xl p-4" style={{ height: '400px' }}>
                    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
                        <GoogleMap
                            mapContainerStyle={{ width: '100%', height: '100%' }}
                            center={mapCenter}
                            zoom={14}
                        >
                            {filteredIncidents.map((incident) => (
                                <Marker
                                    key={incident.id}
                                    position={{
                                        lat: Number(incident.latitude),
                                        lng: Number(incident.longitude)
                                    }}
                                    title={incident.title}
                                    icon={{
                                        url: `https://maps.google.com/mapfiles/ms/icons/${incident.severity === 'critical' ? 'red' :
                                                incident.severity === 'high' ? 'orange' :
                                                    incident.severity === 'medium' ? 'yellow' : 'green'
                                            }-dot.png`
                                    }}
                                    onClick={() => {
                                        setMapCenter({
                                            lat: Number(incident.latitude),
                                            lng: Number(incident.longitude)
                                        });
                                    }}
                                />
                            ))}
                        </GoogleMap>
                    </LoadScript>
                </div>

                {/* Incident Form Modal */}
                <Modal
                    title={`${editingId ? 'Edit' : 'Add'} Incident`}
                    open={isModalVisible}
                    onCancel={() => setIsModalVisible(false)}
                    footer={null}
                    width={800}
                >
                    <div className="grid grid-cols-2 gap-4">
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSubmit}
                        >
                            <Form.Item
                                name="title"
                                label="Title"
                                rules={[{ required: true, message: 'Please input incident title!' }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                name="description"
                                label="Description"
                                rules={[{ required: true, message: 'Please input description!' }]}
                            >
                                <Input.TextArea />
                            </Form.Item>
                            <Form.Item
                                name="status"
                                label="Status"
                                rules={[{ required: true, message: 'Please select status!' }]}
                            >
                                <Select>
                                    <Select.Option value="pending">Pending</Select.Option>
                                    <Select.Option value="in_progress">In Progress</Select.Option>
                                    <Select.Option value="resolved">Resolved</Select.Option>
                                    <Select.Option value="closed">Closed</Select.Option>
                                </Select>
                            </Form.Item>
                            <Form.Item
                                name="severity"
                                label="Severity"
                                rules={[{ required: true, message: 'Please select severity!' }]}
                            >
                                <Select>
                                    <Select.Option value="low">Low</Select.Option>
                                    <Select.Option value="medium">Medium</Select.Option>
                                    <Select.Option value="high">High</Select.Option>
                                    <Select.Option value="critical">Critical</Select.Option>
                                </Select>
                            </Form.Item>
                            <Form.Item
                                name="barangay_id"
                                label="Barangay"
                                rules={[{ required: true, message: 'Please select barangay!' }]}
                            >
                                <Select>
                                    {barangays.map(barangay => (
                                        <Select.Option key={barangay.id} value={barangay.id}>
                                            {barangay.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item
                                name="creator"
                                label="Creator"
                                rules={[{ required: true, message: 'Please input creator name!' }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                name="latitude"
                                label="Latitude"
                                rules={[{ required: true, message: 'Please input latitude!' }]}
                            >
                                <Input type="number" step="any" />
                            </Form.Item>
                            <Form.Item
                                name="longitude"
                                label="Longitude"
                                rules={[{ required: true, message: 'Please input longitude!' }]}
                            >
                                <Input type="number" step="any" />
                            </Form.Item>
                            {editingId && (
                                <Form.Item
                                    name="image_path"
                                    label="Current Image"
                                >
                                    {form.getFieldValue('image_path') && (
                                        <Image
                                            width={200}
                                            src={`/storage/${form.getFieldValue('image_path')}`}
                                            alt="Incident Image"
                                        />
                                    )}
                                </Form.Item>
                            )}
                            <Form.Item>
                                <Space>
                                    <Button type="primary" htmlType="submit">
                                        {editingId ? 'Update' : 'Create'}
                                    </Button>
                                    <Button onClick={() => setIsModalVisible(false)}>
                                        Cancel
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Form>

                        <div style={{ height: '400px' }}>
                            <GoogleMap
                                mapContainerStyle={{ width: '100%', height: '100%' }}
                                center={selectedPosition}
                                zoom={14}
                                onClick={handleMapClick}
                            >
                                <Marker
                                    position={selectedPosition}
                                    draggable={true}
                                    onDragEnd={(e) => {
                                        const lat = e.latLng?.lat();
                                        const lng = e.latLng?.lng();
                                        if (lat && lng) {
                                            setSelectedPosition({ lat: Number(lat), lng: Number(lng) });
                                            form.setFieldsValue({
                                                latitude: lat,
                                                longitude: lng
                                            });
                                        }
                                    }}
                                />
                            </GoogleMap>
                        </div>
                    </div>
                </Modal>

                {/* Filter Modal */}
                <Modal
                    title="Filter Incidents"
                    open={isFilterModalVisible}
                    onCancel={() => setIsFilterModalVisible(false)}
                    footer={null}
                >
                    <Form
                        layout="vertical"
                        onFinish={handleFilterSubmit}
                        initialValues={{
                            barangay: filters.barangay,
                            status: filters.status,
                        }}
                    >
                        <Form.Item
                            name="barangay"
                            label="Filter by Barangay"
                        >
                            <Select allowClear>
                                {barangays.map(barangay => (
                                    <Select.Option key={barangay.id} value={barangay.id}>
                                        {barangay.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="status"
                            label="Filter by Status"
                        >
                            <Select allowClear>
                                <Select.Option value="pending">Pending</Select.Option>
                                <Select.Option value="in_progress">In Progress</Select.Option>
                                <Select.Option value="resolved">Resolved</Select.Option>
                                <Select.Option value="closed">Closed</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item>
                            <Space>
                                <Button type="primary" htmlType="submit">
                                    Apply Filters
                                </Button>
                                <Button onClick={resetFilters}>
                                    Reset Filters
                                </Button>
                                <Button onClick={() => setIsFilterModalVisible(false)}>
                                    Cancel
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </AppLayout>
    );
}
