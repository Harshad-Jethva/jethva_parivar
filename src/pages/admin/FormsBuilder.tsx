import { useState, useEffect } from 'react';
import { supabase, FormTemplate, FormSubmission } from '../../lib/supabase';
import { Save, Plus, Trash2, ListTodo, Database } from 'lucide-react';

export function FormsBuilder() {
  const [forms, setForms] = useState<FormTemplate[]>([]);
  const [selectedForm, setSelectedForm] = useState<FormTemplate | null>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);

  // New field state
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState('text');
  const [fieldLabelEn, setFieldLabelEn] = useState('');
  const [fieldRequired, setFieldRequired] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadForms();
  }, []);

  useEffect(() => {
    if (selectedForm) {
      setFields(selectedForm.fields || []);
      loadSubmissions(selectedForm.id);
    }
  }, [selectedForm]);

  const loadForms = async () => {
    try {
      const { data, error } = await supabase.from('forms').select('*');
      if (error) throw error;
      setForms(data || []);
      if (data && data.length > 0 && !selectedForm) {
        setSelectedForm(data[0]);
      }
    } catch (err) {
      console.error('Error loading forms:', err);
    }
  };

  const loadSubmissions = async (formId: string) => {
    try {
      const { data, error } = await supabase.from('form_submissions').select('*').eq('form_id', formId).order('created_at', { ascending: false });
      if (error) throw error;
      setSubmissions(data || []);
    } catch (err) {
      console.error('Error loading submissions:', err);
    }
  };

  const saveFormFields = async () => {
    if (!selectedForm) return;
    try {
      const { error } = await supabase.from('forms').update({ fields }, selectedForm.id);
      if (error) throw error;
      setMessage({ type: 'success', text: 'Form fields saved successfully!' });
      loadForms();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const addField = () => {
    if (!fieldName) return;
    const newField = {
      name: fieldName.toLowerCase().replace(/[^a-z_]/g, ''),
      type: fieldType,
      label_en: fieldLabelEn || fieldName,
      label_gu: fieldLabelEn || fieldName,
      label_hi: fieldLabelEn || fieldName,
      required: fieldRequired
    };
    setFields([...fields, newField]);
    setFieldName('');
    setFieldLabelEn('');
    setFieldRequired(false);
  };

  const deleteField = (idx: number) => {
    setFields(fields.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Form Builder & Submissions</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Design custom registration or contact forms and view devotee input logs.</p>
        </div>
        <button
          onClick={saveFormFields}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors font-medium shadow"
        >
          <Save className="w-5 h-5" />
          Save Form Template
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-6">
        
        {/* Left Form List */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 h-fit">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-3 px-2">Forms List</h3>
          <div className="space-y-1">
            {forms.map((f) => (
              <div
                key={f.id}
                onClick={() => setSelectedForm(f)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                  selectedForm?.id === f.id
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <ListTodo className="w-4 h-4" />
                <span className="text-sm font-medium">{f.title_en}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Center Builder / Right Submissions */}
        {selectedForm && (
          <div className="lg:col-span-3 grid md:grid-cols-12 gap-6">
            
            {/* Field Constructor */}
            <div className="md:col-span-7 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
              <h3 className="font-semibold text-gray-800 dark:text-white text-sm">Form Fields Constructor</h3>
              
              <div className="space-y-3">
                {fields.map((f, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-700 text-xs">
                    <div>
                      <span className="font-bold text-gray-800 dark:text-white block">{f.label_en}</span>
                      <span className="text-[10px] text-gray-400 block font-mono">
                        name: {f.name} • type: {f.type} {f.required && '• Required'}
                      </span>
                    </div>
                    <button onClick={() => deleteField(idx)} className="text-gray-400 hover:text-red-500 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Field form */}
              <div className="border-t dark:border-gray-700 pt-4 space-y-3">
                <span className="block text-xs font-semibold text-gray-500 uppercase">Add Input Field</span>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    placeholder="Field ID (e.g. phone)"
                    className="px-3 py-2 border dark:border-gray-700 dark:bg-gray-900 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    value={fieldLabelEn}
                    onChange={(e) => setFieldLabelEn(e.target.value)}
                    placeholder="Label (e.g. Phone Number)"
                    className="px-3 py-2 border dark:border-gray-700 dark:bg-gray-900 rounded-lg text-xs"
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <select
                    value={fieldType}
                    onChange={(e) => setFieldType(e.target.value)}
                    className="px-3 py-2 border dark:border-gray-700 dark:bg-gray-900 rounded-lg text-xs"
                  >
                    <option value="text">Text Box</option>
                    <option value="email">Email</option>
                    <option value="tel">Telephone / Phone</option>
                    <option value="textarea">Paragraph Area</option>
                  </select>
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={fieldRequired}
                      onChange={() => setFieldRequired(!fieldRequired)}
                      className="rounded text-primary-500"
                    />
                    Required field
                  </label>
                  <button
                    onClick={addField}
                    className="flex items-center gap-1.5 px-3 py-2 bg-primary-50 hover:bg-primary-100 text-primary-600 text-xs font-bold rounded-lg transition-colors border border-primary-200"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Field
                  </button>
                </div>
              </div>

            </div>

            {/* Submissions Viewer */}
            <div className="md:col-span-5 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-[500px]">
              <h3 className="font-semibold text-gray-800 dark:text-white text-sm mb-3 flex items-center gap-2">
                <Database className="w-4 h-4 text-primary-500" />
                Submissions ({submissions.length})
              </h3>
              
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                {submissions.map((sub) => (
                  <div key={sub.id} className="p-3 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-lg">
                    <div className="flex justify-between items-center text-[10px] text-gray-400 mb-2 border-b dark:border-gray-800 pb-1">
                      <span>Ref: {sub.id.substring(0, 8)}</span>
                      <span>{new Date(sub.created_at).toLocaleString()}</span>
                    </div>
                    <div className="space-y-1">
                      {Object.keys(sub.data || {}).map((k) => (
                        <div key={k} className="flex gap-2">
                          <span className="font-bold text-gray-500 min-w-[60px] truncate">{k}:</span>
                          <span className="text-gray-800 dark:text-gray-200">{String(sub.data[k])}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {submissions.length === 0 && (
                  <div className="text-center text-gray-400 py-16">
                    No submissions logged for this form.
                  </div>
                )}
              </div>

            </div>

          </div>
        )}
      </div>
    </div>
  );
}
