"use client";

import { useState } from "react";
import { addKnowledgeItem } from "@/lib/actions";
import SubmitButton from "@/components/submit-button";
import ImageUploadField from "../settings/image-upload-field";

export default function KnowledgeForm({ businessId, userId }: { businessId: string; userId: string }) {
  const [type, setType] = useState("product");

  return (
    <form action={addKnowledgeItem} className="card mb-8 space-y-4 p-6">
      <input type="hidden" name="business_id" value={businessId} />
      <div>
        <label className="field-label" htmlFor="type">
          Type
        </label>
        <select
          className="field-input"
          id="type"
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="product">Product or service</option>
          <option value="faq">FAQ</option>
          <option value="policy">Policy</option>
        </select>
      </div>
      <div>
        <label className="field-label" htmlFor="title">
          Title
        </label>
        <input
          className="field-input"
          id="title"
          name="title"
          placeholder="e.g. Ankara jumpsuit, Delivery time, Return policy"
          required
        />
      </div>
      <div>
        <label className="field-label" htmlFor="content">
          Details
        </label>
        <textarea
          className="field-input"
          id="content"
          name="content"
          rows={3}
          placeholder="What should the AI say about this?"
          required
        />
      </div>
      <div>
        <label className="field-label" htmlFor="price">
          Price (leave blank if not applicable)
        </label>
        <input className="field-input" id="price" name="price" type="number" step="0.01" min="0" />
      </div>

      {type === "product" && (
        <ImageUploadField
          name="image_url"
          label="Product photo"
          helpText="Your AI shows this to a customer who asks what the product looks like."
          userId={userId}
          assetKind="avatar"
        />
      )}

      <SubmitButton pendingText="Adding..." className="btn-primary">
        Add to AI knowledge
      </SubmitButton>
    </form>
  );
}
