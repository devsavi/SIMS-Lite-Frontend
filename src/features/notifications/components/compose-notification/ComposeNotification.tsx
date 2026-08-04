"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, Loader2, ChevronsUpDown, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/app/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";
import { Textarea } from "@/app/components/ui/textarea";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/utils/cn";
import { composeNotificationSchema, type ComposeNotificationFormValues } from "../../schemas";
import { useComposeNotification } from "../../hooks/use-notifications";
import type { ComposeNotificationPayload } from "../../types";
import { useUsersList } from "@/features/admin/users/hooks/use-admin-users";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ComposeNotificationProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ComposeNotification({
  trigger,
  onSuccess,
}: ComposeNotificationProps) {
  const [open, setOpen] = React.useState(false);
  const [userPopoverOpen, setUserPopoverOpen] = React.useState(false);
  const [userSearch, setUserSearch] = React.useState("");

  const { mutate: compose, isPending } = useComposeNotification();

  // Fetch users lazily — only when the dialog is open and "user" mode is selected
  const recipientType = React.useRef<string>("all");

  const form = useForm<ComposeNotificationFormValues>({
    resolver: zodResolver(composeNotificationSchema),
    defaultValues: {
      title: "",
      message: "",
      type: "INFO",
      priority: "NORMAL",
      recipient_type: "all",
      recipient_role: undefined,
      recipient_user_id: "",
    },
  });

  const watchedRecipientType = form.watch("recipient_type");
  recipientType.current = watchedRecipientType;

  const { data: usersData, isLoading: isLoadingUsers } = useUsersList(
    watchedRecipientType === "user"
      ? { search: userSearch, limit: 50, status: "ACTIVE" }
      : undefined
  );
  const users = usersData?.data ?? [];

  // The currently selected user (for display)
  const selectedUserId = form.watch("recipient_user_id");
  const selectedUser = users.find((u) => u.id === selectedUserId);

  function onSubmit(values: ComposeNotificationFormValues) {
    let payload: ComposeNotificationPayload;

    if (values.recipient_type === "all") {
      payload = {
        title: values.title,
        message: values.message,
        type: values.type,
        priority: values.priority,
        broadcast_all: true,
      };
    } else if (values.recipient_type === "role") {
      payload = {
        title: values.title,
        message: values.message,
        type: values.type,
        priority: values.priority,
        recipient_role: values.recipient_role!,
      };
    } else {
      payload = {
        title: values.title,
        message: values.message,
        type: values.type,
        priority: values.priority,
        recipient_user_id: values.recipient_user_id!,
      };
    }

    compose(payload, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
        setUserSearch("");
        onSuccess?.();
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <Send className="mr-2 h-3.5 w-3.5" />
            Compose
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Compose Notification</DialogTitle>
          <DialogDescription>
            Send a notification to specific users, a role, or all system users.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notification title…"
                      className="min-h-[40px] resize-none"
                      rows={1}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Message */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write your notification message…"
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Row: Type + Priority */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="INFO">Info</SelectItem>
                        <SelectItem value="SUCCESS">Success</SelectItem>
                        <SelectItem value="WARNING">Warning</SelectItem>
                        <SelectItem value="ERROR">Error / Alert</SelectItem>
                        <SelectItem value="SYSTEM">System</SelectItem>
                        <SelectItem value="PURCHASE_ORDER">Purchase Order</SelectItem>
                        <SelectItem value="GRN">GRN</SelectItem>
                        <SelectItem value="STOCK_RELEASE">Stock Release</SelectItem>
                        <SelectItem value="INVENTORY">Inventory</SelectItem>
                        <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
                        <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                        <SelectItem value="USER">User</SelectItem>
                        <SelectItem value="SECURITY">Security</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="NORMAL">Normal</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="CRITICAL">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Recipient type */}
            <FormField
              control={form.control}
              name="recipient_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipients</FormLabel>
                  <Select
                    onValueChange={(v) => {
                      field.onChange(v);
                      form.setValue("recipient_role", undefined);
                      form.setValue("recipient_user_id", "");
                      setUserSearch("");
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select recipients" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="role">By Role</SelectItem>
                      <SelectItem value="user">Specific User</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Conditional: role selector */}
            {watchedRecipientType === "role" && (
              <FormField
                control={form.control}
                name="recipient_role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="OFFICER">Officer</SelectItem>
                        <SelectItem value="STORE_KEEPER">Store Keeper</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Conditional: user combobox */}
            {watchedRecipientType === "user" && (
              <FormField
                control={form.control}
                name="recipient_user_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User</FormLabel>
                    <Popover open={userPopoverOpen} onOpenChange={setUserPopoverOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {selectedUser ? (
                              <span className="truncate">
                                {selectedUser.name}{" "}
                                <span className="text-muted-foreground">
                                  — {selectedUser.email}
                                </span>
                              </span>
                            ) : (
                              "Search for a user…"
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                        <Command shouldFilter={false}>
                          <CommandInput
                            placeholder="Search by name or email…"
                            value={userSearch}
                            onValueChange={setUserSearch}
                          />
                          <CommandList>
                            {isLoadingUsers ? (
                              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading users…
                              </div>
                            ) : users.length === 0 ? (
                              <CommandEmpty>No users found.</CommandEmpty>
                            ) : (
                              <CommandGroup>
                                {users.map((user) => (
                                  <CommandItem
                                    key={user.id}
                                    value={user.id}
                                    onSelect={(val) => {
                                      field.onChange(val);
                                      setUserPopoverOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4 shrink-0",
                                        field.value === user.id
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    <div className="flex flex-col min-w-0">
                                      <span className="truncate font-medium">
                                        {user.name}
                                      </span>
                                      <span className="truncate text-xs text-muted-foreground">
                                        {user.email} · {user.role}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            )}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-3.5 w-3.5" />
                    Send Notification
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


