import React, { useState, useCallback, useEffect } from 'react';
import { Form, Input, Button, Select, Upload, message, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import axios from 'axios';
import { PageProps } from '@inertiajs/inertia';

const { Option } = Select;

const containerStyle = {
  width: '100%',
  height: '300px',
};

const defaultCenter = {
  lat: 14.5995,
  lng: 120.9842,
};

const heroBannerStyle = {
  background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
  padding: '40px 0',
  textAlign: 'center' as const,
  color: 'white',
  marginBottom: '32px',
};

const heroTitleStyle = {
  fontSize: '32px',
  fontWeight: 'bold' as const,
  marginBottom: '16px',
};

const heroSubtitleStyle = {
  fontSize: '16px',
  opacity: 0.9,
};

interface Barangay {
  id: number;
  name: string;
}

interface Props extends PageProps {
  barangays: Barangay[];
}

const IncidentReportIndex: React.FC<Props> = ({ barangays }) => {
  const [form] = Form.useForm();
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyC_WZ0T_FCfAV_G1yfuBGozFa2zOX9l82c',
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setMarker(currentLocation);
          form.setFieldsValue({
            latitude: currentLocation.lat,
            longitude: currentLocation.lng
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setMarker(defaultCenter);
          form.setFieldsValue({
            latitude: defaultCenter.lat,
            longitude: defaultCenter.lng
          });
        }
      );
    }
  }, [form]);

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarker({ lat, lng });
      form.setFieldsValue({ latitude: lat, longitude: lng });
    }
  }, [form]);

  const onFinish = async (values: any) => {
    const formData = new FormData();

    Object.entries(values).forEach(([key, value]) => {
      if (key === 'image' && value?.file) {
        formData.append('image', value.file);
      } else {
        formData.append(key, value);
      }
    });

    try {
      setLoading(true);
      await axios.post('/submit-incident-report', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      message.success('Incident report submitted successfully!');
      form.resetFields();
      setMarker(null);
      setFileList([]);
    } catch (error) {
      console.error(error);
      message.error('Failed to submit report.');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) return <Spin tip="Loading map..." />;

  return (
    <div>
      <div style={heroBannerStyle}>
        <div style={heroTitleStyle}>Submit Incident Report</div>
        <div style={heroSubtitleStyle}>Help us keep track of incidents in your area</div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label="Click on the map to select location">
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={marker ?? defaultCenter}
              zoom={14}
              onClick={onMapClick}
            >
              {marker && <Marker position={marker} />}
            </GoogleMap>
          </Form.Item>

          <Form.Item name="latitude" label="Latitude" rules={[{ required: true }]}>
            <Input readOnly />
          </Form.Item>

          <Form.Item name="longitude" label="Longitude" rules={[{ required: true }]}>
            <Input readOnly />
          </Form.Item>

          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="Enter incident title" />
          </Form.Item>

          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <Input.TextArea rows={4} placeholder="Describe the incident" />
          </Form.Item>

          {/* <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select placeholder="Select status">
              <Option value="pending">Pending</Option>
              <Option value="in_progress">In Progress</Option>
              <Option value="resolved">Resolved</Option>
              <Option value="closed">Closed</Option>
            </Select>
          </Form.Item> */}

          <Form.Item name="severity" label="Severity" rules={[{ required: true }]}>
            <Select placeholder="Select severity">
              <Option value="low">Low</Option>
              <Option value="medium">Medium</Option>
              <Option value="high">High</Option>
              <Option value="critical">Critical</Option>
            </Select>
          </Form.Item>

          <Form.Item name="creator" label="Your Name" rules={[{ required: true }]}>
            <Input placeholder="Your name" />
          </Form.Item>

          <Form.Item name="barangay_id" label="Barangay" rules={[{ required: true }]}>
            <Select placeholder="Select barangay">
              {barangays.map((barangay) => (
                <Option key={barangay.id} value={barangay.id}>
                  {barangay.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="image" label="Image">
            <Upload
              beforeUpload={() => false}
              onChange={({ fileList }) => setFileList(fileList)}
              fileList={fileList}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Upload Image</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Submit Report
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default IncidentReportIndex;
