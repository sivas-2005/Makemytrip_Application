import React, { useEffect, useState } from "react";
import { Star, ThumbsUp, Flag, MessageCircle, Image as ImageIcon, X } from "lucide-react";
import { useSelector } from "react-redux";
import {
  getReviews,
  addReview,
  replyToReview,
  markReviewHelpful,
  flagReview,
} from "@/api";

const FLAG_REASONS = [
  "Spam or advertising",
  "Offensive language",
  "Not relevant to this listing",
  "Fake review",
  "Other",
];

interface ReviewsSectionProps {
  targetType: "Flight" | "Hotel";
  targetId: string;
}

const StarDisplay = ({ rating, size = "w-4 h-4" }: { rating: number; size?: string }) => (
  <div className="flex items-center text-yellow-400">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        className={`${size} ${n <= rating ? "fill-current" : "text-gray-300"}`}
      />
    ))}
  </div>
);

const ReviewsSection = ({ targetType, targetId }: ReviewsSectionProps) => {
  const user = useSelector((state: any) => state.user.user);

  const [reviews, setReviews] = useState<any[]>([]);
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [draftRating, setDraftRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [draftText, setDraftText] = useState("");
  const [draftPhotos, setDraftPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [replyOpenFor, setReplyOpenFor] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const [flagOpenFor, setFlagOpenFor] = useState<string | null>(null);
  const [flagReason, setFlagReason] = useState(FLAG_REASONS[0]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await getReviews(targetType, targetId, sort);
      setReviews(data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (targetId) loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId, sort]);

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
        ).toFixed(1)
      : null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(
      0,
      3 - draftPhotos.length
    );
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setDraftPhotos((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeDraftPhoto = (index: number) => {
    setDraftPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const submitReview = async () => {
    if (!user || !draftText.trim()) return;
    setSubmitting(true);
    try {
      await addReview({
        targetType,
        targetId,
        userId: user.id,
        userName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Traveller",
        rating: draftRating,
        text: draftText.trim(),
        photos: draftPhotos,
      });
      setDraftText("");
      setDraftPhotos([]);
      setDraftRating(5);
      setShowForm(false);
      await loadReviews();
    } catch (error) {
      console.log(error);
    } finally {
      setSubmitting(false);
    }
  };

  const submitReply = async (reviewId: string) => {
    if (!user || !replyText.trim()) return;
    try {
      await replyToReview(
        reviewId,
        user.id,
        `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Traveller",
        replyText.trim()
      );
      setReplyText("");
      setReplyOpenFor(null);
      await loadReviews();
    } catch (error) {
      console.log(error);
    }
  };

  const handleHelpful = async (reviewId: string) => {
    if (!user) return;
    try {
      await markReviewHelpful(reviewId, user.id);
      await loadReviews();
    } catch (error) {
      console.log(error);
    }
  };

  const submitFlag = async (reviewId: string) => {
    try {
      await flagReview(reviewId, flagReason);
      setFlagOpenFor(null);
      setFlagReason(FLAG_REASONS[0]);
      await loadReviews();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold flex items-center">
            Reviews &amp; Ratings
          </h2>
          {averageRating ? (
            <div className="flex items-center space-x-2 mt-1">
              <StarDisplay rating={Math.round(Number(averageRating))} />
              <span className="text-sm text-gray-600">
                {averageRating} ({reviews.length} review
                {reviews.length !== 1 ? "s" : ""})
              </span>
            </div>
          ) : (
            <p className="text-sm text-gray-500 mt-1">No reviews yet</p>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="text-sm border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
          >
            <option value="newest">Newest</option>
            <option value="highest">Highest rated</option>
            <option value="helpful">Most helpful</option>
          </select>
          {user && (
            <button
              onClick={() => setShowForm((s) => !s)}
              className="text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Write a review
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="border rounded-xl p-4 mb-6 bg-gray-50">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your rating
          </label>
          <div className="flex space-x-1 mb-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onMouseEnter={() => setHoverRating(n)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setDraftRating(n)}
              >
                <Star
                  className={`w-7 h-7 ${
                    n <= (hoverRating || draftRating)
                      ? "fill-current text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
          <textarea
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            placeholder="Share details about your experience..."
            rows={3}
            className="w-full px-3 py-2 border rounded-lg mb-3 focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
          <div className="flex items-center flex-wrap gap-2 mb-3">
            {draftPhotos.map((photo, i) => (
              <div key={i} className="relative">
                <img
                  src={photo}
                  alt="upload preview"
                  className="w-16 h-16 object-cover rounded-lg border"
                />
                <button
                  onClick={() => removeDraftPhoto(i)}
                  className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {draftPhotos.length < 3 && (
              <label className="w-16 h-16 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer text-gray-400 hover:border-red-400 hover:text-red-500">
                <ImageIcon className="w-5 h-5" />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </label>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={submitReview}
              disabled={submitting || !draftText.trim()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 disabled:opacity-60"
            >
              {submitting ? "Posting..." : "Post review"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-gray-500">
          Be the first to review this {targetType.toLowerCase()}.
        </p>
      ) : (
        <div className="space-y-5">
          {reviews.map((review) => (
            <div key={review.id} className="border-t pt-4 first:border-t-0 first:pt-0">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">{review.userName}</span>
                    <StarDisplay rating={review.rating} size="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {review.createdAt
                      ? new Date(review.createdAt).toLocaleDateString()
                      : ""}
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-700 mt-2">{review.text}</p>

              {review.photos && review.photos.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {review.photos.map((photo: string, i: number) => (
                    <img
                      key={i}
                      src={photo}
                      alt="review attachment"
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                  ))}
                </div>
              )}

              <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                <button
                  onClick={() => handleHelpful(review.id)}
                  disabled={!user}
                  className="flex items-center space-x-1 hover:text-red-600 disabled:opacity-50"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Helpful ({review.helpfulCount || 0})</span>
                </button>
                <button
                  onClick={() =>
                    setReplyOpenFor(replyOpenFor === review.id ? null : review.id)
                  }
                  disabled={!user}
                  className="flex items-center space-x-1 hover:text-red-600 disabled:opacity-50"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Reply</span>
                </button>
                <button
                  onClick={() =>
                    setFlagOpenFor(flagOpenFor === review.id ? null : review.id)
                  }
                  className="flex items-center space-x-1 hover:text-red-600"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Report</span>
                </button>
                {review.flagged && (
                  <span className="text-orange-500 font-medium">
                    Reported — under review
                  </span>
                )}
              </div>

              {flagOpenFor === review.id && (
                <div className="mt-3 bg-gray-50 border rounded-lg p-3 flex items-center gap-2">
                  <select
                    value={flagReason}
                    onChange={(e) => setFlagReason(e.target.value)}
                    className="text-sm border rounded-lg px-2 py-1"
                  >
                    {FLAG_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => submitFlag(review.id)}
                    className="text-sm bg-red-600 text-white px-3 py-1 rounded-lg"
                  >
                    Submit
                  </button>
                </div>
              )}

              {review.replies && review.replies.length > 0 && (
                <div className="mt-3 ml-4 space-y-2 border-l-2 pl-4">
                  {review.replies.map((reply: any, i: number) => (
                    <div key={i} className="text-sm">
                      <span className="font-medium">{reply.userName}</span>{" "}
                      <span className="text-gray-600">{reply.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {replyOpenFor === review.id && (
                <div className="mt-3 ml-4 flex items-center gap-2">
                  <input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="flex-1 text-sm border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-red-500"
                  />
                  <button
                    onClick={() => submitReply(review.id)}
                    className="text-sm bg-red-600 text-white px-3 py-1.5 rounded-lg"
                  >
                    Send
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsSection;
