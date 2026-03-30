import { describe, it, expect, beforeEach } from 'vitest';
import { useCsvUpload } from '../../../src/composables/useCsvUpload';

describe('useCsvUpload', () => {
    beforeEach(() => {
        const { clearCsvData } = useCsvUpload();
        clearCsvData();
    });

    it('should initialize with empty rows, headers, and metadata', () => {
        const { rows, headers, sourceName, importedAt } = useCsvUpload();
        
        expect(rows.value).toEqual([]);
        expect(headers.value).toEqual([]);
        expect(sourceName.value).toBeNull();
        expect(importedAt.value).toBeNull();
    });

    it('should set CSV data and metadata correctly', () => {
        const { rows, headers, sourceName, importedAt, setCsvData } = useCsvUpload();
        const testRows = [['value1', 'value2'], ['value3', 'value4']];
        const testHeaders = ['header1', 'header2'];
        const importedDate = new Date('2026-03-25T12:00:00Z');

        setCsvData(testRows, testHeaders, {
            sourceName: 'collection.csv',
            importedAt: importedDate,
        });

        expect(rows.value).toEqual(testRows);
        expect(headers.value).toEqual(testHeaders);
        expect(sourceName.value).toBe('collection.csv');
        expect(importedAt.value).toEqual(importedDate);
    });

    it('should clear CSV data and metadata', () => {
        const { rows, headers, sourceName, importedAt, setCsvData, clearCsvData } = useCsvUpload();
        const testRows = [['value1', 'value2']];
        const testHeaders = ['header1', 'header2'];

        setCsvData(testRows, testHeaders, { sourceName: 'collection.csv' });
        clearCsvData();

        expect(rows.value).toEqual([]);
        expect(headers.value).toEqual([]);
        expect(sourceName.value).toBeNull();
        expect(importedAt.value).toBeNull();
    });

    it('should share state between multiple instances', () => {
        const instance1 = useCsvUpload();
        const instance2 = useCsvUpload();
        const testRows = [['shared']];
        const testHeaders = ['sharedHeader'];

        instance1.setCsvData(testRows, testHeaders);

        expect(instance2.rows.value).toEqual(testRows);
        expect(instance2.headers.value).toEqual(testHeaders);
    });

    it('should overwrite existing data and metadata when setting new CSV data', () => {
        const { rows, headers, sourceName, setCsvData } = useCsvUpload();
        
        setCsvData([['old']], ['oldHeader'], { sourceName: 'old.csv' });
        setCsvData([['new']], ['newHeader'], { sourceName: 'new.csv' });

        expect(rows.value).toEqual([['new']]);
        expect(headers.value).toEqual(['newHeader']);
        expect(sourceName.value).toBe('new.csv');
    });

    it('should handle empty arrays when setting CSV data', () => {
        const { rows, headers, sourceName, importedAt, setCsvData } = useCsvUpload();

        setCsvData([], []);

        expect(rows.value).toEqual([]);
        expect(headers.value).toEqual([]);
        expect(sourceName.value).toBeNull();
        expect(importedAt.value).toBeInstanceOf(Date);
    });
});
