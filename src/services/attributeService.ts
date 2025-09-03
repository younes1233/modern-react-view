import BaseApiService, { ApiResponse } from './baseApiService';

export interface AttributeValue {
  id: number;
  value: string;
  slug: string;
  hex_color: string;
  image: string;
  created_at: string;
  updated_at: string;
}

export interface Attribute {
  id: number;
  name: string;
  slug: string;
  type: string;
  values: AttributeValue[];
  created_at: string;
  updated_at: string;
}

export interface AttributesResponse {
  attributes: Attribute[];
}

export interface AttributeValuesResponse {
  attribute_values: AttributeValue[];
}

export interface CreateAttributeData {
  name: string;
  slug: string;
  type: string;
}

export interface UpdateAttributeData extends Partial<CreateAttributeData> {}

export interface CreateAttributeValueData {
  attribute_id: number;
  value: string;
  slug?: string;
  hex_color?: string;
  image?: string;
}

export interface UpdateAttributeValueData extends Partial<CreateAttributeValueData> {}

class AttributeService extends BaseApiService {
  // Attributes endpoints
  async getAttributes(): Promise<ApiResponse<AttributesResponse>> {
    console.log('Fetching attributes');
    
    try {
      const response = await this.get<ApiResponse<AttributesResponse>>('/attributes');
      console.log('Attributes API response:', response);
      return response;
    } catch (error: any) {
      console.error('Get attributes failed:', error);
      throw new Error(`Failed to fetch attributes: ${error.message}`);
    }
  }

  async createAttribute(data: CreateAttributeData): Promise<ApiResponse<{ attribute: Attribute }>> {
    console.log('Creating attribute with data:', data);
    
    try {
      const response = await this.post<ApiResponse<{ attribute: Attribute }>>('/attributes', data);
      console.log('Create attribute API response:', response);
      return response;
    } catch (error: any) {
      console.error('Create attribute failed:', error);
      throw new Error(`Failed to create attribute: ${error.message}`);
    }
  }

  async updateAttribute(id: number, data: UpdateAttributeData): Promise<ApiResponse<{ attribute: Attribute }>> {
    console.log('Updating attribute:', id, data);
    
    try {
      const response = await this.put<ApiResponse<{ attribute: Attribute }>>(`/attributes/${id}`, data);
      console.log('Update attribute API response:', response);
      return response;
    } catch (error: any) {
      console.error('Update attribute failed:', error);
      throw new Error(`Failed to update attribute: ${error.message}`);
    }
  }

  async deleteAttribute(id: number): Promise<ApiResponse<any>> {
    console.log('Deleting attribute with ID:', id);
    
    try {
      const response = await this.delete<ApiResponse<any>>(`/attributes/${id}`);
      console.log('Delete attribute API response:', response);
      return response;
    } catch (error: any) {
      console.error('Delete attribute failed:', error);
      throw new Error(`Failed to delete attribute: ${error.message}`);
    }
  }

  // Attribute Values endpoints
  async getAttributeValues(): Promise<ApiResponse<AttributeValuesResponse>> {
    console.log('Fetching attribute values');
    
    try {
      const response = await this.get<ApiResponse<AttributeValuesResponse>>('/attribute-values');
      console.log('Attribute values API response:', response);
      return response;
    } catch (error: any) {
      console.error('Get attribute values failed:', error);
      throw new Error(`Failed to fetch attribute values: ${error.message}`);
    }
  }

  async createAttributeValue(data: CreateAttributeValueData): Promise<ApiResponse<{ attribute_value: AttributeValue }>> {
    console.log('Creating attribute value with data:', data);
    
    try {
      const response = await this.post<ApiResponse<{ attribute_value: AttributeValue }>>('/attribute-values', data);
      console.log('Create attribute value API response:', response);
      return response;
    } catch (error: any) {
      console.error('Create attribute value failed:', error);
      throw new Error(`Failed to create attribute value: ${error.message}`);
    }
  }

  async updateAttributeValue(id: number, data: UpdateAttributeValueData): Promise<ApiResponse<{ attribute_value: AttributeValue }>> {
    console.log('Updating attribute value:', id, data);
    
    try {
      const response = await this.put<ApiResponse<{ attribute_value: AttributeValue }>>(`/attribute-values/${id}`, data);
      console.log('Update attribute value API response:', response);
      return response;
    } catch (error: any) {
      console.error('Update attribute value failed:', error);
      throw new Error(`Failed to update attribute value: ${error.message}`);
    }
  }

  async deleteAttributeValue(id: number): Promise<ApiResponse<any>> {
    console.log('Deleting attribute value with ID:', id);
    
    try {
      const response = await this.delete<ApiResponse<any>>(`/attribute-values/${id}`);
      console.log('Delete attribute value API response:', response);
      return response;
    } catch (error: any) {
      console.error('Delete attribute value failed:', error);
      throw new Error(`Failed to delete attribute value: ${error.message}`);
    }
  }
}

export const attributeService = new AttributeService();