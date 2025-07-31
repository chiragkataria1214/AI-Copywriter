import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Palette, Settings, Users, LogOut } from 'lucide-react';

interface HeaderProps {
    effectiveUser: {
        username: string;
        role: string;
    } | null;
    logout: () => void;
    isLoggingOut: boolean;
    setupAdmin: () => void;
    isSettingUpAdmin: boolean;
}

export const Header = ({ effectiveUser, logout, isLoggingOut, setupAdmin, isSettingUpAdmin }: HeaderProps) => {
    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-jones-primary rounded-lg flex items-center justify-center">
                            <Palette className="text-white" size={16} />
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Jones Road Beauty</h1>
                            <p className="text-xs sm:text-sm text-gray-500">AI Copywriter</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600">{effectiveUser?.username}</span>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Settings size={16} className="text-gray-600" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <div className="px-3 py-2 border-b">
                                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span>Connected</span>
                                    </div>
                                    {effectiveUser?.role === 'admin' && (
                                        <div className="text-xs text-blue-600 mt-1">Administrator</div>
                                    )}
                                </div>

                                {effectiveUser?.role !== 'admin' && (
                                    <DropdownMenuItem
                                        onClick={setupAdmin}
                                        disabled={isSettingUpAdmin}
                                        className="flex items-center space-x-2"
                                    >
                                        <Settings size={14} />
                                        <span>{isSettingUpAdmin ? 'Setting up...' : 'Become Admin'}</span>
                                    </DropdownMenuItem>
                                )}

                                {effectiveUser?.role === 'admin' && (
                                    <DropdownMenuItem
                                        onClick={() => window.location.href = '/users'}
                                        className="flex items-center space-x-2"
                                    >
                                        <Users size={14} />
                                        <span>Manage Users</span>
                                    </DropdownMenuItem>
                                )}

                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                    onClick={logout}
                                    disabled={isLoggingOut}
                                    className="flex items-center space-x-2 text-red-600"
                                >
                                    {isLoggingOut ? (
                                        <>
                                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                                            <span>Signing out...</span>
                                        </>
                                    ) : (
                                        <>
                                            <LogOut size={14} />
                                            <span>Sign Out</span>
                                        </>
                                    )}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </header>
    );
}; 