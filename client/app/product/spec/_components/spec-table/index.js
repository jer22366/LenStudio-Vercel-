"use client";

import React from "react";
import { useCompare } from "@/app/product/_context/CompareContext";
import styles from "./spec-table.module.scss";

export default function ComponentsCompareTable() {
  const { compareList, removeFromCompare } = useCompare();


  if (!compareList || compareList.length === 0) {
    return <p className={styles.noProductText}>目前沒有商品規格</p>;
  }

  const filledCompareList = [...compareList, ...Array(3 - compareList.length).fill(null)].slice(0, 3);

  return (
    <table className={`comparison-table container ${styles.comparisonTable}`}>
      <thead>
      <tr>
          <th>比較項目</th>
          {filledCompareList.map((product, index) => (
            <td key={product?.id || `empty-${index}`}>{product ? product.name : ""}</td>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          <th>相機格式</th>
          {compareList.map((product) => (
            <td key={product.id}>{product.specs?.camera_format || product.specs?.cameraFormat || "-"}</td>
          ))}
        </tr>
        <tr>
          <th>推出日期</th>
          {compareList.map((product) => (
            <td key={product.id}>{product.specs?.release_date || product.specs?.releaseDate || "-"}</td>
          ))}
        </tr>
        <tr>
          <th>防水等級</th>
          {compareList.map((product) => (
            <td key={product.id}>{product.specs?.waterproof_level || product.specs?.waterproof_level || "-"}</td>
          ))}
        </tr>
        <tr>
          <th>感光元件像素</th>
          {compareList.map((product) => (
            <td key={product.id}>{product.specs?.sensor_pixels || product.specs?.sensor_pixels || "-"}</td>
          ))}
        </tr>
        <tr>
          <th>有效像素</th>
          {compareList.map((product) => (
            <td key={product.id}>{product.specs?.effective_pixels || product.specs?.effective_pixels || "-"}</td>
          ))}
        </tr>
        <tr>
          <th>感光元件大小</th>
          {compareList.map((product) => (
            <td key={product.id}>{product.specs?.sensor_size || product.specs?.sensor_size || "-"}</td>
          ))}
        </tr>
        <tr>
          <th>感光元件格式</th>
          {compareList.map((product) => (
            <td key={product.id}>{product.specs?.sensor_format || product.specs?.sensor_format || "-"}</td>
          ))}
        </tr>
        <tr>
          <th>最大解像度</th>
          {compareList.map((product) => (
            <td key={product.id}>{product.specs?.max_resolution || product.specs?.max_resolution || "-"}</td>
          ))}
        </tr>
        <tr>
          <th>解晰度選擇</th>
          {compareList.map((product) => (
            <td key={product.id}>{product.specs?.resolution_options || product.specs?.resolution_options || "-"}</td>
          ))}
        </tr>
        <tr>
          <th>壓縮模式</th>
          {compareList.map((product) => (
            <td key={product.id}>{product.specs?.compression_mode || product.specs?.compression_mode || "-"}</td>
          ))}
        </tr>
        <tr>
          <th>影像格式</th>
          {compareList.map((product) => (
            <td key={product.id}>{product.specs?.image_format || product.specs?.image_format || "-"}</td>
          ))}
        </tr>
        <tr>
          <th>無壓縮影像格式</th>
          {compareList.map((product) => (
            <td key={product.id}>{product.specs?.uncompressed_image_format || product.specs?.uncompressed_image_format || "-"}</td>
          ))}
        </tr>
        <tr>
          <th>影像比例</th>
          {compareList.map((product) => (
            <td key={product.id}>{product.specs?.aspect_ratio || product.specs?.aspect_ratio || "-"}</td>
          ))}
        </tr>
        <tr>
          <th>影片解像度</th>
          {compareList.map((product) => (
            <td key={product.id}>{product.specs?.video_resolution || product.specs?.video_resolution || "-"}</td>
          ))}
        </tr>
        <tr>
          <th>影片格式</th>
          {compareList.map((product) => (
            <td key={product.id}>{product.specs?.video_format || product.specs?.video_format || "-"}</td>
          ))}
        </tr>
        <tr>
          <th>音訊格式</th>
          {compareList.map((product) => (
            <td key={product.id}>{product.specs?.audio_format || product.specs?.audio_format || "-"}</td>
          ))}
        </tr>
        <tr>
          <th>訊號轉換器</th>
          {compareList.map((product) => (
            <td key={product.id}>{product.specs?.signal_converter || product.specs?.signal_converter || "-"}</td>
          ))}
        </tr>
        <tr>
          <th>防手震功能</th>
          {compareList.map((product) => (
            <td key={product.id}>{product.specs?.image_stabilization || product.specs?.image_stabilization || "-"}</td>
          ))}
        </tr>
        <tr>
          <th>焦距變換比率</th>
          {compareList.map((product) => (
            <td key={product.id}>{product.specs?.focal_length_conversion || product.specs?.focal_length_conversion || "-"}</td>
          ))}
        </tr>
        <tr>
          <th>感光元件像素</th>
          {compareList.map((product) => (
            <td key={product.id}>{product.specs?.autofocus_conditions || product.specs?.autofocus_conditions || "-"}</td>
          ))}
        </tr>
        <tr>
          <th>自動對焦情況</th>
          {compareList.map((product) => (
            <td key={product.id}>{product.specs?.af_assist_light || product.specs?.af_assist_light || "-"}</td>
          ))}
        </tr>
        <tr>
          <th>AF Assist Light</th>
          {compareList.map((product) => (
            <td key={product.id}>{product.specs?.lens_mount || product.specs?.lens_mount || "-"}</td>
          ))}
        </tr>
        <tr>
          <th>鏡頭接環</th>
          {compareList.map((product) => (
            <td key={product.id}>{product.specs?.exposure_mode || product.specs?.exposure_mode || "-"}</td>
          ))}
        </tr>
        <tr>
          <th>曝光模式</th>
          {compareList.map((product) => (
            <td key={product.id}>{product.specs?.scene_mode || product.specs?.scene_mode || "-"}</td>
          ))}
        </tr>
        <tr>
          <th>場景模式</th>
          {compareList.map((product) => (
            <td key={product.id}>{product.specs?.shutter_speed || product.specs?.shutter_speed || "-"}</td>
          ))}
        </tr>
        <tr>
          <th>快門速度</th>
          {compareList.map((product) => (
            <td key={product.id}>{product.specs?.metering_mode || product.specs?.metering_mode || "-"}</td>
          ))}
        </tr>
        <tr>
          <th>測光模式</th>
          {compareList.map((product) => (
            <td key={product.id}>{product.specs?.exposure_compensation || product.specs?.exposure_compensation || "-"}</td>
          ))}
        </tr>
        <tr>
          <th>曝光補償</th>
          {compareList.map((product) => (
            <td key={product.id}>{product.specs?.auto_exposure_lock || product.specs?.auto_exposure_lock || "-"}</td>
          ))}
        </tr>
        <tr>
          <th>自動曝光鎖</th>
          {compareList.map((product) => (
            <td key={product.id}>{product.specs?.bracketing_exposure || product.specs?.bracketing_exposure || "-"}</td>
          ))}
        </tr>
        <tr>
          <th>包圍曝光</th>
          {compareList.map((product) => (
            <td key={product.id}>{product.specs?.iso_sensitivity || product.specs?.iso_sensitivity || "-"}</td>
          ))}
        </tr>
        <tr>
          <th>ISO 感光值</th>
          {compareList.map((product) => (
            <td key={product.id}>{product.specs?.white_balance_settings || product.specs?.white_balance_settings || "-"}</td>
          ))}
        </tr>
        <tr>
          <th>白平衡設定</th>
          {compareList.map((product) => (
            <td key={product.id}>{product.specs?.self_timer || product.specs?.self_timer || "-"}</td>
          ))}
        </tr>
        <tr>
          <th>自拍</th>
          {compareList.map((product) => (
            <td key={product.id}>{product.specs?.continuous_shooting || product.specs?.continuous_shooting || "-"}</td>
          ))}
        </tr>
        <tr>
          <th>連拍</th>
          {compareList.map((product) => (
            <td key={product.id}>{product.specs?.timed_photography || product.specs?.timed_photography || "-"}</td>
          ))}
        </tr>
        <tr>
          <th>定時拍攝</th>
          {compareList.map((product) => (
            <td key={product.id}>{product.specs?.screen || product.specs?.screen || "-"}</td>
          ))}
        </tr>
        <tr>
          <th>螢幕</th>
          {compareList.map((product) => (
            <td key={product.id}>{product.specs?.optical_viewfinder || product.specs?.optical_viewfinder || "-"}</td>
          ))}
        </tr>
        <tr>
          <th>光學取景器</th>
          {compareList.map((product) => (
            <td key={product.id}>{product.specs?.memory_card || product.specs?.memory_card || "-"}</td>
          ))}
        </tr>
        <tr>
          <th>記憶卡</th>
          {compareList.map((product) => (
            <td key={product.id}>{product.specs?.ports || product.specs?.ports || "-"}</td>
          ))}
        </tr>
        <tr>
          <th>連接埠</th>
          {compareList.map((product) => (
            <td key={product.id}>{product.specs?.video_output || product.specs?.video_output || "-"}</td>
          ))}
        </tr>
        <tr>
          <th>影像輸出</th>
          {compareList.map((product) => (
            <td key={product.id}>{product.specs?.battery_type || product.specs?.battery_type || "-"}</td>
          ))}
        </tr>
        <tr>
          <th>電池種類</th>
          {compareList.map((product) => (
            <td key={product.id}>{product.specs?.portable_battery_charger || product.specs?.portable_battery_charger || "-"}</td>
          ))}
        </tr>
        <tr>
          <th>隨身電池及充電器</th>
          {compareList.map((product) => (
            <td key={product.id}>{product.specs?.battery_life || product.specs?.battery_life || "-"}</td>
          ))}
        </tr>
        <tr>
          <th>電池壽命</th>
          {compareList.map((product) => (
            <td key={product.id}>{product.specs?.body_weight || product.specs?.body_weight || "-"}</td>
          ))}
        </tr>
        <tr>
          <th>機身重量</th>
          {compareList.map((product) => (
            <td key={product.id}>{product.specs?.weight_with_battery || product.specs?.weight_with_battery || "-"}</td>
          ))}
        </tr>
        <tr>
          <th>體積</th>
          {compareList.map((product) => (
            <td key={product.id}>{product.specs?.dimensions || product.specs?.dimensions || "-"}</td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}
