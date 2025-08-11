import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Users2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/utils/useToast';
import { Subpersona } from '@/components/main/shared/types';

interface SubpersonaManagerProps {
  personaId: string;
  personaName: string;
  isAdmin?: boolean;
}

export const SubpersonaManager: React.FC<SubpersonaManagerProps> = ({
  personaId,
  personaName,
  isAdmin = false
}) => {
  const [newSubpersona, setNewSubpersona] = useState({ name: '', description: '' });
  const [editingSubpersona, setEditingSubpersona] = useState<Subpersona | null>(null);
  const queryClient = useQueryClient();

  // Fetch subpersonas for this persona
  const { data: subpersonas = [], isLoading } = useQuery<Subpersona[]>({
    queryKey: ['subpersonas', personaId],
    queryFn: () => apiRequest(`/api/personas/${personaId}/subpersonas`),
    enabled: !!personaId
  });

  // Create subpersona mutation
  const createMutation = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      return await apiRequest(`/api/personas/${personaId}/subpersonas`, {
        method: 'POST',
        body: data
      });
    },
    onSuccess: () => {
      toast({
        title: "Subpersona Created",
        description: "New subpersona has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['subpersonas', personaId] });
      setNewSubpersona({ name: '', description: '' });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create subpersona",
        variant: "destructive",
      });
    }
  });

  // Update subpersona mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; name: string; description: string }) => {
      return await apiRequest(`/api/subpersonas/${data.id}`, {
        method: 'PUT',
        body: { name: data.name, description: data.description }
      });
    },
    onSuccess: () => {
      toast({
        title: "Subpersona Updated",
        description: "Subpersona has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['subpersonas', personaId] });
      setEditingSubpersona(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update subpersona",
        variant: "destructive",
      });
    }
  });

  // Delete subpersona mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/subpersonas/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      toast({
        title: "Subpersona Deleted",
        description: "Subpersona has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['subpersonas', personaId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete subpersona",
        variant: "destructive",
      });
    }
  });

  const handleCreate = () => {
    if (newSubpersona.name.trim()) {
      createMutation.mutate(newSubpersona);
    }
  };

  const handleUpdate = () => {
    if (editingSubpersona && editingSubpersona.name.trim()) {
      updateMutation.mutate({
        id: editingSubpersona.id,
        name: editingSubpersona.name,
        description: editingSubpersona.description || ''
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this subpersona?')) {
      deleteMutation.mutate(id);
    }
  };

  if (!isAdmin) {
    // Show read-only view for non-admin users
    return (
      <div className="mt-4">
        {subpersonas.length > 0 && (
          <div>
            <Label className="text-sm font-medium text-gray-900 mb-2 block">
              <span className="inline-flex items-center">
                <Users2 className="w-4 h-4 mr-2" />
                Subpersonas
              </span>
            </Label>
            <div className="space-y-2">
              {subpersonas.map((subpersona) => (
                <div key={subpersona.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-sm text-gray-900">{subpersona.name}</div>
                  {subpersona.description && (
                    <div className="text-xs text-gray-600 mt-1">{subpersona.description}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mt-4 border-t border-gray-100 pt-4">
      <Label className="text-sm font-medium text-gray-900 mb-3 block">
        <span className="inline-flex items-center">
          <Users2 className="w-4 h-4 mr-2" />
          Subpersonas for {personaName}
        </span>
      </Label>
      <p className="text-xs text-gray-600 mb-4">
        Optional subdivisions of this persona for more targeted messaging.
      </p>

      {/* Existing subpersonas */}
      <div className="space-y-3 mb-4">
        {subpersonas.map((subpersona) => (
          <div key={subpersona.id} className="p-3 border border-gray-200 rounded-lg">
            {editingSubpersona?.id === subpersona.id ? (
              <div className="space-y-3">
                <Input
                  value={editingSubpersona.name}
                  onChange={(e) => setEditingSubpersona({ ...editingSubpersona, name: e.target.value })}
                  placeholder="Subpersona name"
                  className="text-sm"
                />
                <Textarea
                  value={editingSubpersona.description || ''}
                  onChange={(e) => setEditingSubpersona({ ...editingSubpersona, description: e.target.value })}
                  placeholder="Subpersona description"
                  className="text-sm"
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleUpdate}
                    disabled={updateMutation.isPending}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingSubpersona(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">{subpersona.name}</div>
                  {subpersona.description && (
                    <div className="text-xs text-gray-600 mt-1">{subpersona.description}</div>
                  )}
                </div>
                <div className="flex gap-1 ml-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingSubpersona(subpersona)}
                    className="h-6 w-6 p-0"
                  >
                    ✏️
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(subpersona.id)}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add new subpersona */}
      <div className="p-3 border border-dashed border-gray-300 rounded-lg">
        <div className="space-y-3">
          <Input
            value={newSubpersona.name}
            onChange={(e) => setNewSubpersona({ ...newSubpersona, name: e.target.value })}
            placeholder="New subpersona name"
            className="text-sm"
          />
          <Textarea
            value={newSubpersona.description}
            onChange={(e) => setNewSubpersona({ ...newSubpersona, description: e.target.value })}
            placeholder="Subpersona description (optional)"
            className="text-sm"
            rows={2}
          />
          <Button
            size="sm"
            onClick={handleCreate}
            disabled={!newSubpersona.name.trim() || createMutation.isPending}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Subpersona
          </Button>
        </div>
      </div>
    </div>
  );
};