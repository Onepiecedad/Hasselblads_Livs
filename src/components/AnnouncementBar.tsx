import { Truck } from "lucide-react";
import { Link } from "react-router-dom";

const AnnouncementBar = () => {
    return (
        <div className="bg-[#2a4e48] text-white py-2 px-4 text-center text-xs md:text-sm font-medium tracking-wide flex items-center justify-center gap-2">
            <Truck className="w-4 h-4" />
            <span>
                Fri hemleverans vid köp över 600 kr.
                <Link to="/hemleverans" className="underline ml-1 hover:text-white/80 transition-colors">
                    Läs mer
                </Link>
            </span>
        </div>
    );
};

export default AnnouncementBar;
