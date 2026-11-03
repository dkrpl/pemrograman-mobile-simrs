import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator,
} from 'react-native';
import { showAlert } from '../utils/dialog';
import { required } from '../utils/validators';

/**
 * Membuat layar form tambah/ubah generik.
 *
 * Tiap field: { name, label, type, required, requiredOnCreate, validate: [fn],
 *               maxLength, placeholder, default, options, loadOptions, hint, hintOnEdit }
 *  - type        : text (default) | number | email | password | multiline | date | time | select | hidden
 *  - default     : nilai awal saat tambah; boleh berupa fungsi, mis. () => today()
 *  - options     : [{ value, label }] untuk select
 *  - loadOptions : async ({ item, defaults }) => [{ value, label }] untuk select dari API
 *  - requiredOnCreate : wajib saat tambah saja (mis. password user)
 */
export default function makeFormScreen({ api, fields }) {
  return function FormScreen({ route, navigation }) {
    const item = route.params?.item; // ada = mode ubah
    const defaults = route.params?.defaults || {};
    const isEdit = !!item;

    const [values, setValues] = useState(() => {
      const v = {};
      fields.forEach((f) => {
        const def = typeof f.default === 'function' ? f.default() : f.default;
        const fromItem = isEdit && f.type !== 'password' ? item[f.name] : undefined;
        v[f.name] = String(fromItem ?? defaults[f.name] ?? def ?? '');
      });
      return v;
    });
    const [errors, setErrors] = useState({});
    const [options, setOptions] = useState({});
    const [optionFilter, setOptionFilter] = useState({});
    const [saving, setSaving] = useState(false);

    // Muat pilihan untuk field select yang datanya berasal dari API
    useEffect(() => {
      fields.filter((f) => f.loadOptions).forEach(async (f) => {
        try {
          const opts = await f.loadOptions({ item, defaults });
          setOptions((o) => ({ ...o, [f.name]: opts }));
        } catch (e) {
          setOptions((o) => ({ ...o, [f.name]: [] }));
          showAlert('Gagal memuat pilihan', e.message);
        }
      });
    }, []);

    const setField = (name, val) => {
      setValues((v) => ({ ...v, [name]: val }));
      if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
    };

    const isRequired = (f) => f.required || (f.requiredOnCreate && !isEdit);

    const validate = () => {
      const err = {};
      fields.forEach((f) => {
        if (f.type === 'hidden') return;
        const val = values[f.name].trim();
        if (val === '' && !isRequired(f)) return;
        const rules = [...(isRequired(f) ? [required(f.label)] : []), ...(f.validate || [])];
        for (const rule of rules) {
          const msg = rule(val);
          if (msg) { err[f.name] = msg; break; }
        }
      });
      setErrors(err);
      return Object.keys(err).length === 0;
    };

    const handleSave = async () => {
      if (!validate()) return;
      setSaving(true);
      try {
        const body = {};
        fields.forEach((f) => { body[f.name] = values[f.name].trim(); });
        const res = isEdit ? await api.update(item.id, body) : await api.create(body);
        showAlert('Berhasil', res.message, () => navigation.goBack());
      } catch (e) {
        showAlert('Gagal menyimpan', e.message);
      } finally {
        setSaving(false);
      }
    };

    const renderSelect = (f) => {
      const loading = f.loadOptions && options[f.name] === undefined;
      const all = (options[f.name] || f.options || []).map((o) => ({ value: String(o.value), label: String(o.label) }));
      const kw = (optionFilter[f.name] || '').toLowerCase();
      // Pilihan yang sedang terpilih selalu ditampilkan walau tidak cocok dengan filter
      const opts = kw ? all.filter((o) => o.label.toLowerCase().includes(kw) || o.value === values[f.name]) : all;
      return (
        <>
          {all.length > 6 && (
            <TextInput
              style={[s.input, s.optionSearch]}
              placeholder={`Cari ${f.label.toLowerCase()}...`}
              value={optionFilter[f.name] || ''}
              onChangeText={(t) => setOptionFilter((o) => ({ ...o, [f.name]: t }))}
            />
          )}
          <View style={s.chipRow}>
            {loading && <ActivityIndicator color="#2563eb" />}
            {!loading && all.length === 0 && <Text style={s.hint}>Belum ada pilihan tersedia</Text>}
            {opts.map((o) => {
              const active = values[f.name] === o.value;
              return (
                <TouchableOpacity
                  key={o.value}
                  style={[s.chip, active && s.chipActive]}
                  onPress={() => setField(f.name, o.value)}>
                  <Text style={active ? s.chipTextActive : s.chipText}>{o.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      );
    };

    const renderField = (f) => {
      if (f.type === 'hidden') return null;
      const hint = isEdit && f.hintOnEdit ? f.hintOnEdit : f.hint;
      return (
        <View key={f.name}>
          <Text style={s.label}>{f.label}{isRequired(f) ? ' *' : ''}</Text>
          {f.type === 'select' ? renderSelect(f) : (
            <TextInput
              style={[s.input, f.type === 'multiline' && s.multiline, !!errors[f.name] && s.inputError]}
              value={values[f.name]}
              onChangeText={(t) => setField(f.name, t)}
              placeholder={
                f.placeholder || (f.type === 'date' ? 'YYYY-MM-DD' : f.type === 'time' ? 'HH:MM' : undefined)
              }
              keyboardType={
                f.type === 'number' ? 'numeric' : f.type === 'email' ? 'email-address' : 'default'
              }
              secureTextEntry={f.type === 'password'}
              autoCapitalize={['email', 'password'].includes(f.type) ? 'none' : 'sentences'}
              multiline={f.type === 'multiline'}
              maxLength={f.maxLength || (f.type === 'date' ? 10 : f.type === 'time' ? 5 : undefined)}
            />
          )}
          {!!hint && <Text style={s.hint}>{hint}</Text>}
          {!!errors[f.name] && <Text style={s.error}>{errors[f.name]}</Text>}
        </View>
      );
    };

    return (
      <ScrollView style={s.container} keyboardShouldPersistTaps="handled">
        {fields.map(renderField)}
        <TouchableOpacity style={[s.btn, saving && { opacity: 0.7 }]} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" />
                  : <Text style={s.btnText}>{isEdit ? 'Perbarui' : 'Simpan'}</Text>}
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    );
  };
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  label: { fontWeight: '600', marginTop: 14, marginBottom: 6, color: '#111827' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, backgroundColor: '#f9fafb' },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  inputError: { borderColor: '#ef4444' },
  optionSearch: { marginBottom: 8, paddingVertical: 8 },
  error: { color: '#ef4444', marginTop: 4 },
  hint: { color: '#6b7280', fontSize: 12, marginTop: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 16,
    paddingVertical: 6, paddingHorizontal: 12, marginRight: 6, marginBottom: 6,
  },
  chipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  chipText: { color: '#111827' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  btn: { backgroundColor: '#2563eb', padding: 14, borderRadius: 8, marginTop: 24, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
