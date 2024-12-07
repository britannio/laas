import { useState } from 'react';
import { useExperimentStore } from '@/store/experimentStore';
import { Button } from './ui/Button';
import { Dialog } from './ui/Dialog';

interface CreateExperimentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateExperimentModal({ isOpen, onClose }: CreateExperimentModalProps) {
  const [name, setName] = useState('');
  const setExperiment = useExperimentStore((state) => state.setExperiment);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setExperiment({
      id: crypto.randomUUID(),
      name,
      steps: [],
      status: 'draft'
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <h2 className="text-lg font-semibold mb-4">Create New Experiment</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Experiment Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                Create
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
}