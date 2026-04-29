'use client';

import { useState } from 'react';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

export function RejectDialog({ isOpen, onClose, onConfirm }) {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    onConfirm(reason);
    setReason('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Advertisement</DialogTitle>
          <DialogDescription>Please provide a reason for rejection</DialogDescription>
        </DialogHeader>
        <Textarea 
          placeholder="Policy violation, inappropriate content, etc." 
          value={reason} 
          onChange={(e) => setReason(e.target.value)} 
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={handleConfirm}>Reject</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}