import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ModelData {
  value: string;
  label: string;
  description: string;
  price: number;
  currency: string;
  uint: string;
  maxContextToken: number;
  maxOutputToken: number;
  provider: string;
  providerLabel: string;
}

interface ModelSelectorProps {
  model: string;
  onModelChange: (selectedModel: ModelData) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  model,
  onModelChange,
}) => {
  const { t } = useTranslation();
  const [allModels, setAllModels] = useState<ModelData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 获取所有模型数据
    const fetchAllModels = async () => {
      try {
        setLoading(true);
        const modelsData = await window.AIM.chat.getAllModels();
        setAllModels(modelsData.flatModels);
      } catch (error) {
        console.error("获取模型数据失败:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllModels();
  }, []);

  const handleModelChange = (selectedModelValue: string) => {
    const selectedModelData = allModels.find(m => m.value === selectedModelValue);
    if (selectedModelData) {
      onModelChange(selectedModelData);
    }
  };

  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="加载中..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={model} onValueChange={handleModelChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={t("Select AI Model")} />
      </SelectTrigger>
      <SelectContent className="max-h-[350px] overflow-y-auto">
        {allModels.map((m) => (
          <SelectItem key={m.value} value={m.value}>
            {m.providerLabel} - {m.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}; 