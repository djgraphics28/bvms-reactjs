import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Table, Modal, Button, Form, Input, Select, Space, message } from 'antd';
import { useState, useEffect } from 'react';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Vehicles',
        href: '/vehicles',
    },
];

interface Vehicle {
    id: number;
    code: string;
    plate_number: string;
    brand?: string;
    model?: string;
    color?: string;
    year?: string;
    chassis_number?: string;
    engine_number?: string;
    vehicle_type?: string;
    barangay: { id: number; name: string };
}

interface Barangay {
    id: number;
    name: string;
}

export default function Vehicle({ vehicles: initialVehicles, barangays }: { vehicles: Vehicle[]; barangays: Barangay[] }) {
    const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
    const [searchText, setSearchText] = useState('');
    const [selectedBarangay, setSelectedBarangay] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    const columns = [
        {
            title: 'Code',
            dataIndex: 'code',
            key: 'code',
            filteredValue: [searchText],
            onFilter: (value: string, record: Vehicle) =>
                record.code.toLowerCase().includes(value.toLowerCase()) ||
                record.plate_number.toLowerCase().includes(value.toLowerCase()),
        },
        {
            title: 'Plate Number',
            dataIndex: 'plate_number',
            key: 'plate_number',
        },
        {
            title: 'Brand',
            dataIndex: 'brand',
            key: 'brand',
        },
        {
            title: 'Model',
            dataIndex: 'model',
            key: 'model',
        },
        {
            title: 'Barangay',
            dataIndex: 'barangay',
            key: 'barangay',
            render: (barangay: { name: string }) => barangay.name,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: Vehicle) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    />
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.id)}
                        loading={loading}
                    />
                    <Button
                        type="primary"
                        onClick={() => router.get(`/vehicles/${record.id}/location`)}
                    >
                        View Realtime Location
                    </Button>
                </Space>
            ),
        },
    ];

    useEffect(() => {
        setVehicles(initialVehicles);
    }, [initialVehicles]);

    const handleAdd = () => {
        setEditingVehicle(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (vehicle: Vehicle) => {
        setEditingVehicle(vehicle);
        form.setFieldsValue({
            ...vehicle,
            barangay_id: vehicle.barangay.id,
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (id: number) => {
        try {
            setLoading(true);
            await router.delete(`/vehicles/${id}`, {
                onSuccess: () => {
                    setVehicles(vehicles.filter(vehicle => vehicle.id !== id));
                    message.success('Vehicle deleted successfully');
                },
                onError: () => {
                    message.error('Failed to delete vehicle');
                },
                preserveScroll: true,
            });
        } catch (error) {
            message.error('Failed to delete vehicle');
        } finally {
            setLoading(false);
        }
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            if (editingVehicle) {
                await router.put(`/vehicles/${editingVehicle.id}`, values, {
                    onSuccess: (page) => {
                        const updatedVehicle = page.props.vehicles.find((v: Vehicle) => v.id === editingVehicle.id);
                        setVehicles(vehicles.map(vehicle =>
                            vehicle.id === editingVehicle.id ? updatedVehicle : vehicle
                        ));
                        message.success('Vehicle updated successfully');
                        setIsModalVisible(false);
                    },
                    onError: (errors) => {
                        form.setFields(
                            Object.entries(errors).map(([name, errors]) => ({
                                name,
                                errors: Array.isArray(errors) ? errors : [errors],
                            }))
                        );
                    },
                    preserveScroll: true,
                });
            } else {
                await router.post('/vehicles', values, {
                    onSuccess: (page) => {
                        setVehicles([...vehicles, page.props.vehicle]);
                        message.success('Vehicle added successfully');
                        setIsModalVisible(false);
                    },
                    onError: (errors) => {
                        form.setFields(
                            Object.entries(errors).map(([name, errors]) => ({
                                name,
                                errors: Array.isArray(errors) ? errors : [errors],
                            }))
                        );
                    },
                    preserveScroll: true,
                });
            }
        } catch (error) {
            console.error('Validation failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredVehicles = vehicles.filter(vehicle =>
        (!selectedBarangay || vehicle.barangay.id === selectedBarangay) &&
        (searchText === '' ||
         vehicle.code.toLowerCase().includes(searchText.toLowerCase()) ||
         vehicle.plate_number.toLowerCase().includes(searchText.toLowerCase()))
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vehicles Management" />
            <div className="p-4">
                <div className="mb-4 flex justify-between">
                    <Space>
                        <Input
                            placeholder="Search vehicles..."
                            prefix={<SearchOutlined />}
                            onChange={e => setSearchText(e.target.value)}
                            value={searchText}
                            allowClear
                        />
                        <Select
                            placeholder="Filter by Barangay"
                            style={{ width: 200 }}
                            onChange={value => setSelectedBarangay(value)}
                            allowClear
                            value={selectedBarangay}
                        >
                            {barangays.map(barangay => (
                                <Select.Option key={barangay.id} value={barangay.id}>
                                    {barangay.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Space>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                    >
                        Add Vehicle
                    </Button>
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredVehicles}
                    rowKey="id"
                />

                <Modal
                    title={editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
                    open={isModalVisible}
                    onOk={handleModalOk}
                    onCancel={() => setIsModalVisible(false)}
                    destroyOnClose
                    confirmLoading={loading}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        initialValues={{
                            barangay_id: undefined,
                        }}
                    >
                        <Form.Item
                            name="code"
                            label="Code"
                            rules={[{ required: true, message: 'Please input vehicle code!' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="plate_number"
                            label="Plate Number"
                            rules={[{ required: true, message: 'Please input plate number!' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="brand"
                            label="Brand"
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="model"
                            label="Model"
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="color"
                            label="Color"
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="year"
                            label="Year"
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="chassis_number"
                            label="Chassis Number"
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="engine_number"
                            label="Engine Number"
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="vehicle_type"
                            label="Vehicle Type"
                        >
                            <Input />
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
                    </Form>
                </Modal>
            </div>
        </AppLayout>
    );
}
