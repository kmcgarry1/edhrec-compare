import { describe, it, expect, beforeEach } from 'vitest';
import { useCsvUpload } from '../../../src/composables/useCsvUpload';

describe('useCsvUpload', () => {
    beforeEach(() => {
        const { clearCsvData } = useCsvUpload();
        clearCsvData();
    });

    it('should initialize with empty rows and headers', () => {
        const { rows, headers } = useCsvUpload();
        
        expect(rows.value).toEqual([]);
        expect(headers.value).toEqual([]);
    });

    it('should set CSV data correctly', () => {
        const { rows, headers, setCsvData } = useCsvUpload();
        const testRows = [['value1', 'value2'], ['value3', 'value4']];
        const testHeaders = ['header1', 'header2'];

        setCsvData(testRows, testHeaders);

        expect(rows.value).toEqual(testRows);
        expect(headers.value).toEqual(testHeaders);
    });

    it('should clear CSV data', () => {
        const { rows, headers, setCsvData, clearCsvData } = useCsvUpload();
        const testRows = [['value1', 'value2']];
        const testHeaders = ['header1', 'header2'];

        setCsvData(testRows, testHeaders);
        clearCsvData();

        expect(rows.value).toEqual([]);
        expect(headers.value).toEqual([]);
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

    it('should overwrite existing data when setting new CSV data', () => {
        const { rows, headers, setCsvData } = useCsvUpload();
        
        setCsvData([['old']], ['oldHeader']);
        setCsvData([['new']], ['newHeader']);

        expect(rows.value).toEqual([['new']]);
        expect(headers.value).toEqual(['newHeader']);
    });

    it('should handle empty arrays when setting CSV data', () => {
        const { rows, headers, setCsvData } = useCsvUpload();

        setCsvData([], []);

        expect(rows.value).toEqual([]);
        expect(headers.value).toEqual([]);
    });
});