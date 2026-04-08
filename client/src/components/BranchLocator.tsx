import { MapPin, Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Branch {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  hours: string;
  latitude: number;
  longitude: number;
}

interface BranchLocatorProps {
  onClose?: () => void;
}

const MMOCCUL_BRANCHES: Branch[] = [
  {
    id: "hq",
    name: "MMOCCUL Headquarters",
    city: "Yaoundé",
    address: "123 Avenue Kennedy, Yaoundé",
    phone: "+237 222 123 456",
    hours: "Mon-Fri: 8:00 AM - 5:00 PM",
    latitude: 3.8667,
    longitude: 11.5167,
  },
  {
    id: "douala",
    name: "MMOCCUL Douala Branch",
    city: "Douala",
    address: "456 Rue Joss, Douala",
    phone: "+237 233 456 789",
    hours: "Mon-Fri: 8:00 AM - 5:00 PM",
    latitude: 4.0511,
    longitude: 9.7679,
  },
  {
    id: "bamenda",
    name: "MMOCCUL Bamenda Branch",
    city: "Bamenda",
    address: "789 Commercial Avenue, Bamenda",
    phone: "+237 236 789 012",
    hours: "Mon-Fri: 8:00 AM - 5:00 PM",
    latitude: 5.9631,
    longitude: 10.1591,
  },
  {
    id: "buea",
    name: "MMOCCUL Buea Branch",
    city: "Buea",
    address: "321 Main Street, Buea",
    phone: "+237 233 012 345",
    hours: "Mon-Fri: 8:00 AM - 5:00 PM",
    latitude: 4.1578,
    longitude: 9.2405,
  },
];

export function BranchLocator({ onClose }: BranchLocatorProps) {
  return (
    <div className="bg-card rounded-lg p-4 border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Our Branches
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-xl"
          >
            ✕
          </button>
        )}
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {MMOCCUL_BRANCHES.map((branch) => (
          <div
            key={branch.id}
            className="border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors"
          >
            <h4 className="font-semibold text-foreground mb-2">{branch.name}</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                <div>
                  <p>{branch.address}</p>
                  <p className="text-xs">{branch.city}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0 text-primary" />
                <a
                  href={`tel:${branch.phone}`}
                  className="hover:text-primary transition-colors"
                >
                  {branch.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 flex-shrink-0 text-primary" />
                <span>{branch.hours}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 w-full text-primary hover:bg-primary/10"
              onClick={() => {
                const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(
                  branch.address
                )}`;
                window.open(mapsUrl, "_blank");
              }}
            >
              View on Map
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
