import { useEffect, useState } from 'react';
import { Tabs, Table, Button, Modal, Form, Input, message, Space, Select, Switch } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';

interface Barangay {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    users: User[];
    drivers: Driver[];
    vehicles: Vehicle[];
}

interface User {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
}

interface Driver {
    id: number;
    name: string;
    drivers_license_number: string;
    contact_number: string;
    user_id: number | null;
    user?: {
        email: string;
        is_active: boolean;
    };
}

interface Vehicle {
    id: number;
    plate_number: string;
    vehicle_type: string;
    brand: string;
    model: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Barangays',
        href: '/barangays',
    },
    {
        title: 'Info',
        href: '/barangay-info',
    }
];

const { TabPane } = Tabs;
const { Search } = Input;

export default function BarangayInfo({ barangay }: { barangay: Barangay }) {
    const [activeTab, setActiveTab] = useState('1');
    const [userSearch, setUserSearch] = useState('');
    const [driverSearch, setDriverSearch] = useState('');
    const [vehicleSearch, setVehicleSearch] = useState('');

    // Modal states
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalType, setModalType] = useState<'user' | 'driver' | 'vehicle'>('user');
    const [editingRecord, setEditingRecord] = useState<any>(null);
    const [form] = Form.useForm();

    // Initialize data from props
    const [users, setUsers] = useState<User[]>(barangay.users || []);
    const [drivers, setDrivers] = useState<Driver[]>(barangay.drivers || []);
    const [vehicles, setVehicles] = useState<Vehicle[]>(barangay.vehicles || []);

    useEffect(() => {
        setUsers(barangay.users || []);
        setDrivers(barangay.drivers || []);
        setVehicles(barangay.vehicles || []);
    }, [barangay]);

    const showModal = (type: 'user' | 'driver' | 'vehicle', record?: any) => {
        setModalType(type);
        setEditingRecord(record);

        if (record) {
            const values = { ...record };
            if (type === 'driver' && record.user) {
                values.email = record.user.email;
                values.user_id = record.user.id;
            }
            form.setFieldsValue(values);
        } else {
            form.resetFields();
        }
        setIsModalVisible(true);
    };

    const handleDelete = (type: 'user' | 'driver' | 'vehicle', id: number) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this item?',
            onOk: () => {
                router.delete(`/barangay/${barangay.id}/${type}/${id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        message.success('Deleted successfully');
                        // Update local state
                        switch (type) {
                            case 'user':
                                setUsers(users.filter(user => user.id !== id));
                                break;
                            case 'driver':
                                setDrivers(drivers.filter(driver => driver.id !== id));
                                break;
                            case 'vehicle':
                                setVehicles(vehicles.filter(vehicle => vehicle.id !== id));
                                break;
                        }
                    },
                    onError: () => {
                        message.error('Failed to delete');
                    }
                });
            }
        });
    };

    const handleModalOk = () => {
        form.validateFields().then(values => {
            const endpoint = editingRecord
                ? `/barangay/${barangay.id}/${modalType}/${editingRecord.id}`
                : `/barangay/${barangay.id}/${modalType}`;

            router[editingRecord ? 'put' : 'post'](endpoint, values, {
                preserveScroll: true,
                onSuccess: (page) => {
                    message.success(`${editingRecord ? 'Updated' : 'Created'} successfully`);
                    setIsModalVisible(false);
                    form.resetFields();

                    // Update local state
                    if (modalType === 'driver') {
                        setDrivers(page.props.drivers || []);
                        setUsers(page.props.users || []);
                    } else if (modalType === 'user') {
                        setUsers(page.props.users || []);
                    } else if (modalType === 'vehicle') {
                        setVehicles(page.props.vehicles || []);
                    }
                },
                onError: (errors) => {
                    message.error(`Operation failed: ${errors.message}`);
                }
            });
        });
    };

    // const handleModalOk = () => {
    //     form.validateFields().then(values => {
    //         if (editingRecord) {
    //             // Update
    //             router.put(`/barangay/${barangay.id}/${modalType}/${editingRecord.id}`, values, {
    //                 preserveScroll: true,
    //                 onSuccess: () => {
    //                     message.success('Updated successfully');
    //                     setIsModalVisible(false);
    //                     form.resetFields();
    //                     // Update local state
    //                     switch (modalType) {
    //                         case 'user':
    //                             setUsers(users.map(user =>
    //                                 user.id === editingRecord.id ? { ...user, ...values } : user
    //                             ));
    //                             break;
    //                         case 'driver':
    //                             setDrivers(drivers.map(driver =>
    //                                 driver.id === editingRecord.id ? { ...driver, ...values } : driver
    //                             ));
    //                             break;
    //                         case 'vehicle':
    //                             setVehicles(vehicles.map(vehicle =>
    //                                 vehicle.id === editingRecord.id ? { ...vehicle, ...values } : vehicle
    //                             ));
    //                             break;
    //                     }
    //                 },
    //                 onError: (errors) => {
    //                     message.error('Update failed');
    //                 }
    //             });
    //         } else {
    //             // Create
    //             router.post(`/barangay/${barangay.id}/${modalType}`, values, {
    //                 preserveScroll: true,
    //                 onSuccess: (page) => {
    //                     message.success('Created successfully');
    //                     setIsModalVisible(false);
    //                     form.resetFields();
    //                     // Update local state with the new record from the response
    //                     const newRecord = page.props[modalType + 's'].find((r: any) =>
    //                         !users.concat(drivers).concat(vehicles).some(existing => existing.id === r.id)
    //                     );
    //                     if (newRecord) {
    //                         switch (modalType) {
    //                             case 'user':
    //                                 setUsers([...users, newRecord]);
    //                                 break;
    //                             case 'driver':
    //                                 setDrivers([...drivers, newRecord]);
    //                                 break;
    //                             case 'vehicle':
    //                                 setVehicles([...vehicles, newRecord]);
    //                                 break;
    //                         }
    //                     }
    //                 },
    //                 onError: (errors) => {
    //                     message.error('Creation failed');
    //                 }
    //             });
    //         }
    //     });
    // };

    const userColumns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            filteredValue: [userSearch],
            onFilter: (value: string, record: User) =>
                record.name.toLowerCase().includes(value.toLowerCase()) ||
                record.email.toLowerCase().includes(value.toLowerCase()),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Status',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (isActive: boolean) => (
                <span className={isActive ? 'text-green-500' : 'text-red-500'}>
                    {isActive ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record: User) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => showModal('user', record)} />
                    <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete('user', record.id)} />
                </Space>
            ),
        },
    ];

    const driverColumns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            filteredValue: [driverSearch],
            onFilter: (value: string, record: Driver) =>
                record.name.toLowerCase().includes(value.toLowerCase()) ||
                (record.user?.email?.toLowerCase().includes(value.toLowerCase()) || false) ||
                record.drivers_license_number.toLowerCase().includes(value.toLowerCase()) ||
                (record.contact_number?.toLowerCase().includes(value.toLowerCase()) || false),
        },
        {
            title: 'Email',
            key: 'email',
            render: (_, record: Driver) => record.user?.email || '-',
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
            render: (contact_number: string) => contact_number || '-',
        },
        {
            title: 'Status',
            key: 'status',
            render: (_, record: Driver) => (
                <span className={record.user?.is_active ? 'text-green-500' : 'text-red-500'}>
                    {record.user?.is_active ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record: Driver) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => showModal('driver', record)} />
                    <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete('driver', record.id)} />
                </Space>
            ),
        },
    ];

    const vehicleColumns = [
        {
            title: 'Plate Number',
            dataIndex: 'plate_number',
            key: 'plate_number',
            filteredValue: [vehicleSearch],
            onFilter: (value: string, record: Vehicle) =>
                record.plate_number.toLowerCase().includes(value.toLowerCase()) ||
                record.vehicle_type.toLowerCase().includes(value.toLowerCase()) ||
                (record.brand && record.brand.toLowerCase().includes(value.toLowerCase())) ||
                (record.model && record.model.toLowerCase().includes(value.toLowerCase())),
        },
        {
            title: 'Type',
            dataIndex: 'vehicle_type',
            key: 'vehicle_type',
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
            title: 'Actions',
            key: 'actions',
            render: (_, record: Vehicle) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => showModal('vehicle', record)} />
                    <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete('vehicle', record.id)} />
                </Space>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Barangay Information" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex justify-between mb-4">
                    <h1 className="text-2xl font-bold">Barangay {barangay.name} Info</h1>
                </div>

                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                    <TabPane tab="User Admins" key="1">
                        <div className="flex justify-between mb-4">
                            <Search
                                placeholder="Search users..."
                                onChange={e => setUserSearch(e.target.value)}
                                style={{ width: 300 }}
                            />
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal('user')}>
                                Add Admin
                            </Button>
                        </div>
                        <Table columns={userColumns} dataSource={users} rowKey="id" />
                    </TabPane>

                    <TabPane tab="Drivers" key="2">
                        <div className="flex justify-between mb-4">
                            <Search
                                placeholder="Search drivers..."
                                onChange={e => setDriverSearch(e.target.value)}
                                style={{ width: 300 }}
                            />
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal('driver')}>
                                Add Driver
                            </Button>
                        </div>
                        <Table columns={driverColumns} dataSource={drivers} rowKey="id" />
                    </TabPane>

                    <TabPane tab="Vehicle Monitoring" key="3">
                        <div className="flex justify-between mb-4">
                            <Search
                                placeholder="Search vehicles..."
                                onChange={e => setVehicleSearch(e.target.value)}
                                style={{ width: 300 }}
                            />
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal('vehicle')}>
                                Add Vehicle
                            </Button>
                        </div>
                        <Table columns={vehicleColumns} dataSource={vehicles} rowKey="id" />
                    </TabPane>
                </Tabs>

                <Modal
                    title={`${editingRecord ? 'Edit' : 'Add'} ${modalType.charAt(0).toUpperCase() + modalType.slice(1)}`}
                    open={isModalVisible}
                    onOk={handleModalOk}
                    onCancel={() => {
                        setIsModalVisible(false);
                        form.resetFields();
                    }}
                    width={600}
                >
                    <Form form={form} layout="vertical">
                        {modalType === 'user' && (
                            <>
                                <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                                    <Input />
                                </Form.Item>
                                <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                                    <Input />
                                </Form.Item>
                                {!editingRecord && (
                                    <Form.Item name="password" label="Password" rules={[{ required: !editingRecord }]}>
                                        <Input.Password />
                                    </Form.Item>
                                )}
                                <Form.Item name="is_active" label="Status" valuePropName="checked">
                                    <Switch checkedChildren="Active" unCheckedChildren="Inactive" defaultChecked />
                                </Form.Item>
                            </>
                        )}
                        {modalType === 'driver' && (
                            <>
                                <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                                    <Input />
                                </Form.Item>
                                <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                                    <Input />
                                </Form.Item>
                                {!editingRecord && (
                                    <Form.Item name="password" label="Password" rules={[{ required: true }]}>
                                        <Input.Password />
                                    </Form.Item>
                                )}
                                <Form.Item name="drivers_license_number" label="License No" rules={[{ required: true }]}>
                                    <Input />
                                </Form.Item>
                                <Form.Item name="contact_number" label="Contact Number">
                                    <Input />
                                </Form.Item>
                                {editingRecord && (
                                    <Form.Item name="user_id" hidden>
                                        <Input type="hidden" />
                                    </Form.Item>
                                )}
                            </>
                        )}
                        {modalType === 'vehicle' && (
                            <>
                                {editingRecord && (
                                    <Form.Item name="vehicle_id" hidden>
                                        <Input type="hidden" />
                                    </Form.Item>
                                )}
                                <Form.Item name="code" label="Code" rules={[{ required: true }]}>
                                    <Input />
                                </Form.Item>
                                <Form.Item name="plate_number" label="Plate Number" rules={[{ required: true }]}>
                                    <Input />
                                </Form.Item>
                                <Form.Item name="vehicle_type" label="Vehicle Type" rules={[{ required: true }]}>
                                    <Select>
                                        <Select.Option value="Motorcycle">Motorcycle</Select.Option>
                                        <Select.Option value="Car">Car</Select.Option>
                                        <Select.Option value="Truck">Truck</Select.Option>
                                        <Select.Option value="Van">Van</Select.Option>
                                        <Select.Option value="SUV">SUV</Select.Option>
                                    </Select>
                                </Form.Item>
                                <Form.Item name="brand" label="Brand">
                                    <Input />
                                </Form.Item>
                                <Form.Item name="model" label="Model">
                                    <Input />
                                </Form.Item>
                            </>
                        )}
                    </Form>
                </Modal>
            </div>
        </AppLayout>
    );
}
