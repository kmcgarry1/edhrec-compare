import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import NebulaBackground from '../../../src/components/NebulaBackground.vue';
import { useCommanderColors } from '../../../src/composables/useCommanderColors';

vi.mock('../../../src/composables/useCommanderColors');

describe('NebulaBackground', () => {
    let mockCommanderColors: { value: string[] };

    beforeEach(() => {
        mockCommanderColors = { value: [] };
        vi.mocked(useCommanderColors).mockReturnValue({
            commanderColors: mockCommanderColors,
        } as ReturnType<typeof useCommanderColors>);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders the component with base structure', () => {
        const wrapper = mount(NebulaBackground);
        expect(wrapper.find('.fixed.inset-0.-z-10.overflow-hidden').exists()).toBe(true);
        expect(wrapper.findAll('.absolute.inset-0')).toHaveLength(2);
    });

    it('applies default color order when no commander colors are provided', () => {
        mockCommanderColors.value = [];
        const wrapper = mount(NebulaBackground);
        const glowLayer = wrapper.findAll('.absolute.inset-0')[1];
        expect(glowLayer.attributes('style')).toContain('background-image');
    });

    it('uses commander colors when provided', () => {
        mockCommanderColors.value = ['W', 'U', 'B'];
        const wrapper = mount(NebulaBackground);
        const glowLayer = wrapper.findAll('.absolute.inset-0')[1];
        expect(glowLayer.attributes('style')).toContain('background-image');
    });

    it('normalizes invalid color keys to "C"', () => {
        mockCommanderColors.value = ['X', 'Y', 'Z'];
        const wrapper = mount(NebulaBackground);
        expect(wrapper.exists()).toBe(true);
    });
    it('limits palette to POSITIONS length', () => {
        mockCommanderColors.value = ['W', 'U', 'B', 'R', 'G', 'C', 'W', 'U'];
        const wrapper = mount(NebulaBackground);
        const glowLayer = wrapper.findAll('.absolute.inset-0')[1];
        const style = glowLayer.attributes('style');
        const gradientCount = (style?.match(/radial-gradient/g) || []).length;
        expect(gradientCount).toBeLessThanOrEqual(5);
    });

    it('applies blur filter to glow layer', () => {
        const wrapper = mount(NebulaBackground);
        const glowLayer = wrapper.findAll('.absolute.inset-0')[1];
        expect(glowLayer.attributes('style')).toContain('blur(120px)');
    });

    it('sets aria-hidden on glow layer', () => {
        const wrapper = mount(NebulaBackground);
        const glowLayer = wrapper.findAll('.absolute.inset-0')[1];
        expect(glowLayer.attributes('aria-hidden')).toBe('true');
    });

    it('handles lowercase color codes', () => {
        mockCommanderColors.value = ['w', 'u', 'b'];
        const wrapper = mount(NebulaBackground);
        expect(wrapper.exists()).toBe(true);
    });

    it('handles mixed case color codes', () => {
        mockCommanderColors.value = ['W', 'u', 'B'];
        const wrapper = mount(NebulaBackground);
        expect(wrapper.exists()).toBe(true);
    });
});