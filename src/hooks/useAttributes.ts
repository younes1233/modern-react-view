import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  attributeService, 
  CreateAttributeData, 
  UpdateAttributeData,
  CreateAttributeValueData,
  UpdateAttributeValueData,
  Attribute,
  AttributeValue
} from '../services/attributeService';

// Attributes hooks
export const useAttributes = () => {
  return useQuery({
    queryKey: ['attributes'],
    queryFn: async () => {
      const response = await attributeService.getAttributes();
      return response.details?.attributes || [];
    },
  });
};

export const useCreateAttribute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAttributeData) => attributeService.createAttribute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attributes'] });
      toast.success('Attribute created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create attribute: ${error.message}`);
    },
  });
};

export const useUpdateAttribute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAttributeData }) => 
      attributeService.updateAttribute(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attributes'] });
      toast.success('Attribute updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update attribute: ${error.message}`);
    },
  });
};

export const useDeleteAttribute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => attributeService.deleteAttribute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attributes'] });
      toast.success('Attribute deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete attribute: ${error.message}`);
    },
  });
};

// Attribute Values hooks
export const useAttributeValues = () => {
  return useQuery({
    queryKey: ['attribute-values'],
    queryFn: async () => {
      const response = await attributeService.getAttributeValues();
      return response.details?.attribute_values || [];
    },
  });
};

export const useCreateAttributeValue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAttributeValueData) => attributeService.createAttributeValue(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attribute-values'] });
      queryClient.invalidateQueries({ queryKey: ['attributes'] });
      toast.success('Attribute value created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create attribute value: ${error.message}`);
    },
  });
};

export const useUpdateAttributeValue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAttributeValueData }) => 
      attributeService.updateAttributeValue(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attribute-values'] });
      queryClient.invalidateQueries({ queryKey: ['attributes'] });
      toast.success('Attribute value updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update attribute value: ${error.message}`);
    },
  });
};

export const useDeleteAttributeValue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => attributeService.deleteAttributeValue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attribute-values'] });
      queryClient.invalidateQueries({ queryKey: ['attributes'] });
      toast.success('Attribute value deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete attribute value: ${error.message}`);
    },
  });
};