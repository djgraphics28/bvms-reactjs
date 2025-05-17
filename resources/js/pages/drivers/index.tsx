import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Table, Modal, Button, Form, Input, Select, Space, message } from 'antd';
import { useState, useEffect } from 'react';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Drivers',
        href: '/drivers',
    },
];

interface Driver {
    id: number;
    name: string;
    barangay: { id: number; name: string };
    drivers_license_number: string;
    contact_number: string;
    user?: {
        id: number;
        email: string;
    };
}

interface Barangay {
    id: number;
    name: string;
}

interface UserFormData {
    email: string;
    password?: string;
}

export default function Driver({ drivers: initialDrivers, barangays }: { drivers: Driver[]; barangays: Barangay[] }) {
    const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
    const [searchText, setSearchText] = useState('');
    const [selectedBarangay, setSelectedBarangay] = useState<number | null>(null);

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            filteredValue: [searchText],
            onFilter: (value: string, record: Driver) =>
                record.name.toLowerCase().includes(value.toLowerCase()),
        },
        {
            title: 'Barangay',
            dataIndex: 'barangay',
            key: 'barangay',
            render: (barangay: { name: string }) => barangay.name,
        },
        {
            title: 'License No',
            dataIndex: 'drivers_license_number',
            key: 'drivers_license_number',
        },
        {
            title: 'Contact',
            dataIndex: 'contact_number',
            key: 'contact_number',
        },
        {
            title: 'Email',
            dataIndex: 'user',
            key: 'email',
            render: (user?: { email: string }) => user?.email || 'N/A',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: Driver) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    />
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.id)}
                    />
                </Space>
            ),
        },
    ];

    useEffect(() => {
        setDrivers(initialDrivers);
    }, [initialDrivers]);

    const handleAdd = () => {
        setEditingDriver(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (driver: Driver) => {
        setEditingDriver(driver);
        form.setFieldsValue({
            ...driver,
            barangay_id: driver.barangay.id,
            email: driver.user?.email,
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await window.axios.delete(`/drivers/${id}`);
            setDrivers(drivers.filter(driver => driver.id !== id));
            message.success('Driver deleted successfully');
        } catch (error) {
            message.error('Failed to delete driver');
        }
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();

            if (editingDriver) {
                const { data: updatedDriver } = await window.axios.put(`/drivers/${editingDriver.id}`, {
                    ...values,
                    barangay_id: values.barangay_id,
                });

                setDrivers(drivers.map(driver =>
                    driver.id === editingDriver.id ? updatedDriver : driver
                ));
                message.success('Driver updated successfully');
            } else {
                const { data: newDriver } = await window.axios.post('/drivers', {
                    ...values,
                    barangay_id: values.barangay_id,
                });

                setDrivers([...drivers, newDriver]);
                message.success('Driver added successfully');
            }

            setIsModalVisible(false);
        } catch (error) {
            message.error('Operation failed');
        }
    };

    const filteredDrivers = drivers.filter(driver =>
        (!selectedBarangay || driver.barangay.id === selectedBarangay)
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Drivers Management" />
            <div className="p-4">
                <div className="mb-4 flex justify-between">
                    <Space>
                        <Input
                            placeholder="Search drivers..."
                            prefix={<SearchOutlined />}
                            onChange={e => setSearchText(e.target.value)}
                            value={searchText}
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
                        Add Driver
                    </Button>
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredDrivers}
                    rowKey="id"
                />

                <Modal
                    title={editingDriver ? 'Edit Driver' : 'Add Driver'}
                    open={isModalVisible}
                    onOk={handleModalOk}
                    onCancel={() => setIsModalVisible(false)}
                    destroyOnClose
                >
                    <Form
                        form={form}
                        layout="vertical"
                        initialValues={{
                            barangay_id: undefined,
                        }}
                    >
                        <Form.Item
                            name="name"
                            label="Name"
                            rules={[{ required: true, message: 'Please input driver name!' }]}
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

                        <Form.Item
                            name="drivers_license_number"
                            label="License No"
                            rules={[{ required: true, message: 'Please input license number!' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="contact_number"
                            label="Contact"
                            rules={[{ required: false, message: 'Please input contact number!' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                { required: !editingDriver, message: 'Please input email!' },
                                { type: 'email', message: 'Please enter a valid email!' },
                            ]}
                        >
                            <Input type="email" />
                        </Form.Item>

                        {!editingDriver && (
                            <Form.Item
                                name="password"
                                label="Password"
                                rules={[
                                    { required: true, message: 'Please input password!' },
                                    { min: 8, message: 'Password must be at least 8 characters!' },
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>
                        )}
                    </Form>
                </Modal>
            </div>
        </AppLayout>
    );
}
