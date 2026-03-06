import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from './ThemeToggle';
import { useThemeStore } from '../stores/theme';

describe('ThemeToggle', () => {
    beforeEach(() => {
        useThemeStore.setState({ theme: 'system' });
    });

    it('renders all three theme buttons', () => {
        render(<ThemeToggle />);
        expect(screen.getByTitle('Light Mode')).toBeInTheDocument();
        expect(screen.getByTitle('System Theme')).toBeInTheDocument();
        expect(screen.getByTitle('Dark Mode')).toBeInTheDocument();
    });

    it('changes theme to light when light button is clicked', () => {
        render(<ThemeToggle />);
        fireEvent.click(screen.getByTitle('Light Mode'));
        expect(useThemeStore.getState().theme).toBe('light');
    });

    it('changes theme to dark when dark button is clicked', () => {
        render(<ThemeToggle />);
        fireEvent.click(screen.getByTitle('Dark Mode'));
        expect(useThemeStore.getState().theme).toBe('dark');
    });

    it('changes theme to system when system button is clicked', () => {
        useThemeStore.setState({ theme: 'light' });
        render(<ThemeToggle />);
        fireEvent.click(screen.getByTitle('System Theme'));
        expect(useThemeStore.getState().theme).toBe('system');
    });
});
