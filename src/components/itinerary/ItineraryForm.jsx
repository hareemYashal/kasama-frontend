import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Save, X } from "lucide-react";
import { format } from "date-fns";

export default function ItineraryForm({ trip, item, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    date: '',
    start_time: '',
    end_time: '',
    activity_title: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (item) {
      setFormData({
        date: item.date || '',
        start_time: item.start_time || '',
        end_time: item.end_time || '',
        activity_title: item.activity_title || '',
        notes: item.notes || ''
      });
    } else {
      setFormData({
        date: '',
        start_time: '',
        end_time: '',
        activity_title: '',
        notes: ''
      });
    }
  }, [item]);

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const tripStart = new Date(trip.start_date);
      const tripEnd = new Date(trip.end_date);
      
      if (selectedDate < tripStart || selectedDate > tripEnd) {
        newErrors.date = 'Date must be within trip dates';
      }
    }

    if (!formData.start_time) {
      newErrors.start_time = 'Start time is required';
    }

    if (!formData.end_time) {
      newErrors.end_time = 'End time is required';
    } else if (formData.start_time && formData.end_time <= formData.start_time) {
      newErrors.end_time = 'End time must be after start time';
    }

    if (!formData.activity_title) {
      newErrors.activity_title = 'Activity title is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-slate-200/60 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <Calendar className="w-5 h-5 text-blue-600" />
          {item ? 'Edit Activity' : 'Add New Activity'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="date" className="text-base font-semibold text-slate-700">
                Date *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => updateFormData('date', e.target.value)}
                min={trip.start_date}
                max={trip.end_date}
                className={`mt-2 ${errors.date ? 'border-red-500' : 'border-slate-200'}`}
              />
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">{errors.date}</p>
              )}
              <p className="text-sm text-slate-500 mt-1">
                Must be between {format(new Date(trip.start_date), 'MMM d')} - {format(new Date(trip.end_date), 'MMM d, yyyy')}
              </p>
            </div>

            <div>
              <Label htmlFor="activity_title" className="text-base font-semibold text-slate-700">
                Activity Title *
              </Label>
              <Input
                id="activity_title"
                placeholder="e.g., Beach Day, City Tour, Dinner at Restaurant"
                value={formData.activity_title}
                onChange={(e) => updateFormData('activity_title', e.target.value)}
                className={`mt-2 ${errors.activity_title ? 'border-red-500' : 'border-slate-200'}`}
              />
              {errors.activity_title && (
                <p className="text-red-500 text-sm mt-1">{errors.activity_title}</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="start_time" className="text-base font-semibold text-slate-700">
                Start Time *
              </Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => updateFormData('start_time', e.target.value)}
                className={`mt-2 ${errors.start_time ? 'border-red-500' : 'border-slate-200'}`}
              />
              {errors.start_time && (
                <p className="text-red-500 text-sm mt-1">{errors.start_time}</p>
              )}
            </div>

            <div>
              <Label htmlFor="end_time" className="text-base font-semibold text-slate-700">
                End Time *
              </Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) => updateFormData('end_time', e.target.value)}
                className={`mt-2 ${errors.end_time ? 'border-red-500' : 'border-slate-200'}`}
              />
              {errors.end_time && (
                <p className="text-red-500 text-sm mt-1">{errors.end_time}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="notes" className="text-base font-semibold text-slate-700">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any additional details, meeting points, or special instructions..."
              value={formData.notes}
              onChange={(e) => updateFormData('notes', e.target.value)}
              className="mt-2 border-slate-200 min-h-24"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="px-6"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-6 bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {item ? 'Update Activity' : 'Add Activity'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}