import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { Skeleton } from "./ui/skeleton";

interface ProfileLink {
  id: string;
  platform: string;
  url: string;
}

export function UserDataDialogBox({ data }: { data: any }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");
  const [bio, setBio] = useState("");
  const [profileLinks, setProfileLinks] = useState<ProfileLink[]>([
    { id: "1", platform: "", url: "" },
  ]);
  useEffect(() => {
    if (data) {
      if (data.email?.length > 0) setEmail(data.email);
      if (data.fullName?.length > 0) setFullName(data.fullName);
      if (data.phone?.length > 0) setPhone(data.phone);
      if (data.location?.length > 0) setLocation(data.location);
      if (data.skills?.length > 0) setSkills(data.skills);
      if (data.bio?.length > 0) setBio(data.bio);
      if (data.profileLinks?.length > 0) setProfileLinks(data.profileLinks);
    }
  }, [data]);

  const addProfileLink = () => {
    const newLink: ProfileLink = {
      id: Math.random().toString(36).substring(2, 9),
      platform: "",
      url: "",
    };
    setProfileLinks([...profileLinks, newLink]);
  };

  const removeProfileLink = (id: string) => {
    if (profileLinks.length > 1) {
      setProfileLinks(profileLinks.filter((link) => link.id !== id));
    }
  };

  const updateProfileLink = (
    id: string,
    field: "platform" | "url",
    value: string
  ) => {
    setProfileLinks(
      profileLinks.map((link) =>
        link.id === id ? { ...link, [field]: value } : link
      )
    );
  };

  const handleSaveProfile = async () => {
    const profileData = {
      fullName,
      email,
      phone,
      location,
      skills,
      bio,
      profileLinks,
    };

    try {
      const res = await axios.post("/api/userProfile", profileData);
      toast.success("Profile Saved Successfully");
    } catch (error) {
      toast.error("Error Saving profile");
      console.error("Error saving profile:", error);
    }
    console.log("Profile Saved:", profileData);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="relative h-max w-max">
          <Button variant="outline">Edit Professional Profile</Button>
          <p className="border-2 border-red-500 bg-red-500 absolute top-0 right-0 h-2 w-2 rounded-full"></p>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[50vw] h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Professional Profile</DialogTitle>
          <DialogDescription>
            Update your professional details for job applications.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Personal Information</h3>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fullName" className="text-right">
                Full Name
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (123) 456-7890"
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
                className="col-span-3"
              />
            </div>
          </div>

          {/* Profile Links */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Profile Links</h3>
              <Button
                onClick={addProfileLink}
                type="button"
                size="sm"
                variant="outline"
                className="h-8"
              >
                <Plus className="mr-1 h-4 w-4" />
                Add Link
              </Button>
            </div>

            {profileLinks.map((link) => (
              <div
                key={link.id}
                className="grid grid-cols-12 items-center gap-2"
              >
                <div className="col-span-5">
                  <Input
                    placeholder="Platform (e.g., LinkedIn)"
                    value={link.platform}
                    onChange={(e) =>
                      updateProfileLink(link.id, "platform", e.target.value)
                    }
                  />
                </div>
                <div className="col-span-6">
                  <Input
                    placeholder="https://..."
                    value={link.url}
                    onChange={(e) =>
                      updateProfileLink(link.id, "url", e.target.value)
                    }
                  />
                </div>
                <div className="col-span-1 flex justify-end">
                  <Button
                    onClick={() => removeProfileLink(link.id)}
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={profileLinks.length <= 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Skills & Additional Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Additional Information</h3>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="skills" className="text-right">
                Skills
              </Label>
              <Input
                id="skills"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="JavaScript, React, TypeScript"
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <Label htmlFor="bio" className="text-right mt-2">
                Bio
              </Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief description about your professional background"
                className="col-span-3 min-h-24"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" onClick={handleSaveProfile}>
            Save Profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
