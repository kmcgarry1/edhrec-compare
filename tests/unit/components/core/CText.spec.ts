import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import CText from '../../../../src/components/core/CText.vue';

describe('CText', () => {
    it('renders with default props', () => {
        const wrapper = mount(CText, {
            slots: {
                default: 'Test content'
            }
        });

        expect(wrapper.text()).toBe('Test content');
        expect(wrapper.element.tagName).toBe('P');
        expect(wrapper.classes()).toContain('c-text');
        expect(wrapper.classes()).toContain('text-sm');
        expect(wrapper.classes()).toContain('text-slate-700');
    });

    it('renders with custom tag', () => {
        const wrapper = mount(CText, {
            props: {
                tag: 'span'
            }
        });

        expect(wrapper.element.tagName).toBe('SPAN');
    });

    it('applies variant classes correctly', () => {
        const wrapper = mount(CText, {
            props: {
                variant: 'title'
            }
        });

        expect(wrapper.classes()).toContain('text-base');
        expect(wrapper.classes()).toContain('font-semibold');
    });

    it('applies tone classes correctly', () => {
        const wrapper = mount(CText, {
            props: {
                tone: 'danger'
            }
        });

        expect(wrapper.classes()).toContain('text-rose-600');
    });

    it('applies weight classes correctly', () => {
        const wrapper = mount(CText, {
            props: {
                weight: 'bold'
            }
        });

        expect(wrapper.classes()).toContain('font-bold');
    });

    it('applies align classes correctly', () => {
        const wrapper = mount(CText, {
            props: {
                align: 'center'
            }
        });

        expect(wrapper.classes()).toContain('text-center');
    });

    it('applies wrap classes correctly', () => {
        const wrapper = mount(CText, {
            props: {
                wrap: 'truncate'
            }
        });

        expect(wrapper.classes()).toContain('truncate');
    });

    it('applies leading classes correctly', () => {
        const wrapper = mount(CText, {
            props: {
                leading: 'tight'
            }
        });

        expect(wrapper.classes()).toContain('leading-tight');
    });

    it('combines multiple prop classes', () => {
        const wrapper = mount(CText, {
            props: {
                variant: 'label',
                tone: 'success',
                weight: 'medium',
                align: 'right'
            }
        });

        expect(wrapper.classes()).toContain('text-xs');
        expect(wrapper.classes()).toContain('text-emerald-600');
        expect(wrapper.classes()).toContain('font-medium');
        expect(wrapper.classes()).toContain('text-right');
    });

    it('forwards attributes correctly', () => {
        const wrapper = mount(CText, {
            attrs: {
                id: 'test-id',
                'data-testid': 'custom-text'
            }
        });

        expect(wrapper.attributes('id')).toBe('test-id');
        expect(wrapper.attributes('data-testid')).toBe('custom-text');
    });
});
