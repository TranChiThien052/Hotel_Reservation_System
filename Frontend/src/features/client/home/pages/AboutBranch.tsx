import BranchCard from "../components/BranchCard";
import { useCallback, useEffect, useState } from "react";
import { branchApi } from "@/features/admin/adminBranch/api/admin-api";
import type { Branch } from "@/features/admin/adminBranch/types/branch-type";
import { FaHotel } from "react-icons/fa";
import DaLat from "@/assets/images/DaLat.png";
import MuiNe from "@/assets/images/MuiNe.png";

const BRANCH_IMAGES = [DaLat, MuiNe];

const AboutBranch = () => {
  const [branchData, setBranchData] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBranch = useCallback(async () => {
    try {
      const data = await branchApi.getBranches();
      setBranchData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching branch data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranch();
  }, [fetchBranch]);

  return (
    <section className="py-12 px-4 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-2 mb-2">
          <FaHotel className="text-blue-500 text-2xl" />
          <h2 className="text-2xl font-bold text-gray-800">Hệ thống chi nhánh</h2>
        </div>
        <p className="text-sm text-gray-400">Khám phá các chi nhánh của chúng tôi trên toàn quốc</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : branchData.length === 0 ? (
        <p className="text-center text-gray-400 py-16">Không có chi nhánh nào.</p>
      ) : (
        <div className="flex flex-col gap-5">
          {branchData.map((branch, index) => (
            <BranchCard
              key={branch.id}
              branch={branch}
              image={BRANCH_IMAGES[index % BRANCH_IMAGES.length]}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default AboutBranch;