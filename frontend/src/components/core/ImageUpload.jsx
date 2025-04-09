import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function ImageUpload({ onUpload }) {
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(file));
      onUpload(file);
    } else {
      alert("Only image files are allowed.");
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(file));
      onUpload(file);
    } else {
      alert("Only image files are allowed.");
    }
  };

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-4 hover:border-blue-500 transition-colors",
        preview ? "border-green-500" : "border-gray-300"
      )}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => inputRef.current.click()}
    >
      {preview ? (
        <img
          src={preview}
          alt="Profile Preview"
          className="w-40 h-32 object-cover rounded mx-auto"
        />
      ) : (
        <div className="text-center">
          <p className="text-gray-500">Drag & Drop or Click to Upload</p>
          <Button type="button" variant="outline" className="mt-2">
            Choose File
          </Button>
        </div>
      )}
      <Input
        type="file"
        accept="image/*"
        className="hidden"
        ref={inputRef}
        onChange={handleFileChange}
      />
    </div>
  );
}
