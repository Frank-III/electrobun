import { createSignal, createEffect } from "solid-js";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { IconSpinner } from "../../../icons";
import { toast } from "solid-sonner";
// Hook to detect narrow screen
function useIsNarrowScreen(): boolean {
	const [isNarrow, setIsNarrow] = createSignal(false);
	createEffect(() => {
		const checkWidth = () => {
			setIsNarrow(window.innerWidth <= 768);
		};
		checkWidth();
		window.addEventListener("resize", checkWidth);
		return () => window.removeEventListener("resize", checkWidth);
	});
	return isNarrow;
}
interface DesktopUser {
	id: string;
	email: string;
	name: string | null;
	imageUrl: string | null;
	username: string | null;
}
export function AgentsProfileTab() {
	const [user, setUser] = createSignal(null);
	const [fullName, setFullName] = createSignal("");
	const [isSaving, setIsSaving] = createSignal(false);
	const [isLoading, setIsLoading] = createSignal(true);
	const isNarrowScreen = useIsNarrowScreen();
	// Fetch real user data from desktop API
	createEffect(() => {
		async function fetchUser() {
			if (window.desktopApi?.getUser) {
				const userData = await window.desktopApi.getUser();
				setUser(userData);
				setFullName(userData?.name || "");
			}
			setIsLoading(false);
		}
		fetchUser();
	});
	const handleSave = async () => {
		setIsSaving(true);
		try {
			if (window.desktopApi?.updateUser) {
				const updatedUser = await window.desktopApi.updateUser({ name: fullName });
				if (updatedUser) {
					setUser(updatedUser);
					toast.success("Profile updated successfully");
				}
			} else {
				throw new Error("Desktop API not available");
			}
		} catch (error) {
			console.error("Error updating profile:", error);
			toast.error(error instanceof Error ? error.message : "Failed to update profile");
		} finally {
			setIsSaving(false);
		}
	};
	if (isLoading) {
		return <div class="flex items-center justify-center h-full">
        <IconSpinner class="h-6 w-6" />
      </div>;
	}
	return <div class="p-6 space-y-6">
      {	/* Profile Settings Card */}
      <div class="space-y-2">
        { /* Header - hidden on narrow screens since it's in the navigation bar */}
        {!isNarrowScreen && <div class="flex items-center justify-between pb-3 mb-4">
            <h3 class="text-sm font-medium text-foreground">Account</h3>
          </div>}
        <div class="bg-background rounded-lg border border-border overflow-hidden">
          <div class="p-4 space-y-6">
            { /* Full Name Field */}
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <Label class="text-sm font-medium">Full Name</Label>
                <p class="text-sm text-muted-foreground">
                  This is your display name
                </p>
              </div>
              <div class="flex-shrink-0 w-80">
                <Input value={fullName} onInput={(e) => setFullName(e.currentTarget.value)} class="w-full" placeholder="Enter your name" />
              </div>
            </div>

            { /* Email Field (read-only) */}
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <Label class="text-sm font-medium">Email</Label>
                <p class="text-sm text-muted-foreground">
                  Your account email
                </p>
              </div>
              <div class="flex-shrink-0 w-80">
                <Input value={user?.email || ""} disabled class="w-full opacity-60" />
              </div>
            </div>
          </div>

          { /* Save Button Footer */}
          <div class="bg-muted p-3 rounded-b-lg flex justify-end gap-3 border-t">
            <Button onClick={handleSave} disabled={isSaving} size="sm" class="text-xs">
              <div class="flex items-center justify-center gap-2">
                {isSaving && <IconSpinner class="h-3.5 w-3.5 text-current" />}
                Save
              </div>
            </Button>
          </div>
        </div>
      </div>

    </div>;
 }
