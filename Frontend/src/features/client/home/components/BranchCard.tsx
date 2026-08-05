import type { Branch } from "@/features/admin/adminBranch/types/branch-type";
import { FiMapPin, FiPhone, FiMail } from "react-icons/fi";

interface BranchCardProps {
  branch: Branch;
  image: string;
}

const BranchCard = ({ branch, image }: BranchCardProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-row">
      
      <div className="w-56 shrink-0 h-auto">
        <img
          src={image}
          alt={branch.name}
          className="w-full h-full object-cover"
        />
      </div>

      
      <div className="p-5 flex flex-col justify-center gap-2 flex-1">
        <div>
          <h3 className="text-lg font-bold text-gray-800">{branch.name}</h3>
          <span className="inline-block text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mt-1">
            {branch.city}
          </span>
        </div>
        

        <div className="flex flex-col gap-1.5 text-sm text-gray-500 mt-1">
          <div className="flex items-start gap-2">
            <FiMapPin className="mt-0.5 shrink-0 text-gray-400" />
            <span>{branch.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <FiPhone className="shrink-0 text-gray-400" />
            <span>{branch.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <FiMail className="shrink-0 text-gray-400" />
            <span>{branch.email}</span>
          </div>
        </div>

        {branch.description ? (
          <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 mt-1">
            {branch.description}
          </p>
        ) : (
            <p className="text-xs text-gray-400 italic mt-1">Không có mô tả</p>
        )}
      </div>
    </div>
  );
};

export default BranchCard;