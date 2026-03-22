import React, { useState } from "react";
import { ScrollView } from "react-native";
import { YStack, XStack, Text, Button, Input, Label, Spinner } from "tamagui";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useLedgerStore } from "@/stores/useLedgerStore";
import { useTransactionStore } from "@/stores/useTransactionStore";

const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      "Must be a positive number",
    ),
  note: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

export default function AddTransactionTab() {
  const router = useRouter();
  const { activeLedgerId } = useLedgerStore();
  const { addTransaction, isLoading } = useTransactionStore();

  const [type, setType] = useState<"income" | "expense">("expense");

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense",
      amount: "",
      note: "",
    },
  });

  const onSubmit = async (data: TransactionFormData) => {
    if (!activeLedgerId) return;

    await addTransaction({
      ledgerId: activeLedgerId,
      type: type,
      amount: Number(data.amount),
      note: data.note,
      occurredAt: Date.now(),
    });

    reset();
    router.replace("/(tabs)");
  };

  if (!activeLedgerId) {
    return (
      <YStack f={1} jc="center" ai="center" p="$4">
        <Text color="$gray10">Please select or create a ledger first.</Text>
      </YStack>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }}>
      <YStack f={1} p="$4" gap="$4">
        {/* Type Selector */}
        <XStack gap="$2" mb="$2">
          <Button
            f={1}
            theme={type === "expense" ? "red" : "active"}
            onPress={() => setType("expense")}
          >
            Expense
          </Button>
          <Button
            f={1}
            theme={type === "income" ? "green" : "active"}
            onPress={() => setType("income")}
          >
            Income
          </Button>
        </XStack>

        {/* Form Fields */}
        <YStack gap="$2">
          <Label htmlFor="amount">Amount</Label>
          <Controller
            control={control}
            name="amount"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                id="amount"
                keyboardType="numeric"
                placeholder="0.00"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                borderColor={errors.amount ? "$red10" : undefined}
              />
            )}
          />
          {errors.amount && (
            <Text color="$red10" fontSize="$2">
              {errors.amount.message}
            </Text>
          )}
        </YStack>

        <YStack gap="$2">
          <Label htmlFor="note">Note (Optional)</Label>
          <Controller
            control={control}
            name="note"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                id="note"
                placeholder="Groceries..."
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
        </YStack>

        {/* Actions */}
        <XStack gap="$3" mt="$4">
          <Button
            f={1}
            variant="outlined"
            onPress={() => {
              reset();
              router.replace("/(tabs)");
            }}
          >
            Cancel
          </Button>
          <Button
            f={1}
            theme="active"
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            {isLoading ? <Spinner /> : "Save"}
          </Button>
        </XStack>
      </YStack>
    </ScrollView>
  );
}
