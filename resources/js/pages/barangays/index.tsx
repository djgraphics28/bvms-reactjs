import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Space } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';

interface Barangay {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Barangays',
        href: '/barangays',
    }
];

const GOOGLE_MAPS_API_KEY = 'AIzaSyC_WZ0T_FCfAV_G1yfuBGozFa2zOX9l82c';
const DEFAULT_CENTER = { lat: 15.9061, lng: 120.5853 }; // Villasis coordinates

export default function Barangays() {
    const { props } = usePage();
    const [barangays, setBarangays] = useState<Barangay[]>(props.barangays || []);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState<number | null>(null);
    const [selectedPosition, setSelectedPosition] = useState(DEFAULT_CENTER);
    const [selectedBarangay, setSelectedBarangay] = useState<Barangay | null>(null);
    const [mapCenter, setMapCenter] = useState<{lat: number, lng: number}>(DEFAULT_CENTER);
    const [selectedMarker, setSelectedMarker] = useState<Barangay | null>(null);

    useEffect(() => {
        setBarangays(props.barangays || []);
    }, [props.barangays]);

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Latitude',
            dataIndex: 'latitude',
            key: 'latitude',
        },
        {
            title: 'Longitude',
            dataIndex: 'longitude',
            key: 'longitude',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record: Barangay) => (
                <Space>
                    <Button
                        icon={<InfoCircleOutlined />}
                        onClick={() => router.visit(`/barangays/${record.id}/info`)}
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

    const handleEdit = (record: Barangay) => {
        setEditingId(record.id);
        form.setFieldsValue(record);
        setSelectedPosition({ lat: Number(record.latitude), lng: Number(record.longitude) });
        setIsModalVisible(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await router.delete(`/barangays/${id}`, {
                preserveState: true,
                preserveScroll: true
            });
            message.success('Barangay deleted successfully');
        } catch (error) {
            message.error('Failed to delete barangay');
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
                await router.put(`/barangays/${editingId}`, values, {
                    preserveState: true,
                    preserveScroll: true
                });
            } else {
                await router.post('/barangays', values, {
                    preserveState: true,
                    preserveScroll: true
                });
            }
            message.success(`Barangay ${editingId ? 'updated' : 'created'} successfully`);
            setIsModalVisible(false);
            form.resetFields();
            setEditingId(null);
            setSelectedPosition(DEFAULT_CENTER);
        } catch (error) {
            message.error(`Failed to ${editingId ? 'update' : 'create'} barangay`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Barangays Management" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex justify-between mb-4">
                    <h1 className="text-2xl font-bold">Barangays Management</h1>
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
                        Add Barangay
                    </Button>
                </div>

                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    <div className="border rounded-xl p-4">
                        <Table
                            columns={columns}
                            dataSource={barangays}
                            rowKey="id"
                            onRow={(record) => ({
                                onClick: () => {
                                    setSelectedBarangay(record);
                                    setMapCenter({ lat: Number(record.latitude), lng: Number(record.longitude) });
                                }
                            })}
                        />
                    </div>

                    <div className="border rounded-xl p-4" style={{ height: '600px' }}>
                        <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
                            <GoogleMap
                                mapContainerStyle={{ width: '100%', height: '100%' }}
                                center={mapCenter}
                                zoom={14}
                            >
                                {barangays.map((barangay) => (
                                    <Marker
                                        key={barangay.id}
                                        position={{
                                            lat: Number(barangay.latitude),
                                            lng: Number(barangay.longitude)
                                        }}
                                        title={barangay.name}
                                        onClick={() => setSelectedMarker(barangay)}
                                        animation={selectedBarangay?.id === barangay.id ? google.maps.Animation.BOUNCE : undefined}
                                    />
                                ))}
                                {selectedMarker && (
                                    <InfoWindow
                                        position={{
                                            lat: Number(selectedMarker.latitude),
                                            lng: Number(selectedMarker.longitude)
                                        }}
                                        onCloseClick={() => setSelectedMarker(null)}
                                    >
                                        <div>
                                            <h3>{selectedMarker.name}</h3>
                                            <p>Latitude: {selectedMarker.latitude}</p>
                                            <p>Longitude: {selectedMarker.longitude}</p>
                                        </div>
                                    </InfoWindow>
                                )}
                            </GoogleMap>
                        </LoadScript>
                    </div>
                </div>

                <Modal
                    title={`${editingId ? 'Edit' : 'Add'} Barangay`}
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
                                name="name"
                                label="Barangay Name"
                                rules={[{ required: true, message: 'Please input barangay name!' }]}
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
            </div>
        </AppLayout>
    );
}
