import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';

export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient.getProjects().then(res => res.data),
  });
};

export const useProject = (id) => {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => apiClient.getProject(id).then(res => res.data),
    enabled: !!id,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => apiClient.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => apiClient.updateProject(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['projects']);
      queryClient.invalidateQueries(['project', variables.id]);
    },
  });
};