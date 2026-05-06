const problems = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    category: "Array",
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
      },
    ],
    starterCode: {
      javascript: `function twoSum(nums, target) {
  // Write your solution here
}`,
      python: `def two_sum(nums, target):
    # Write your solution here
    pass`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
    }
}`,
      cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution here
    }
};`
    },
    solution: {
      javascript: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      python: `def two_sum(nums, target):
    num_map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_map:
            return [num_map[complement], i]
        num_map[num] = i
    return []`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[] {};
    }
}`,
      cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> numMap;
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (numMap.find(complement) != numMap.end()) {
                return {numMap[complement], i};
            }
            numMap[nums[i]] = i;
        }
        return {};
    }
};`
    },
    testCases: [
      { input: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { input: [[3, 2, 4], 6], expected: [1, 2] },
      { input: [[3, 3], 6], expected: [0, 1] },
    ],
  },
  {
    id: "reverse-string",
    title: "Reverse String",
    difficulty: "Easy",
    category: "String",
    description: `Write a function that reverses a string. The input string is given as an array of characters s.

You must do this by modifying the input array in-place with O(1) extra memory.`,
    examples: [
      { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' },
      { input: 's = ["H","a","n","n","a","h"]', output: '["h","a","n","n","a","H"]' },
    ],
    starterCode: {
      javascript: `function reverseString(s) {
  // Write your solution here
}`,
      python: `def reverse_string(s):
    # Write your solution here
    pass`,
      java: `class Solution {
    public void reverseString(char[] s) {
        // Write your solution here
    }
}`,
      cpp: `class Solution {
public:
    void reverseString(vector<char>& s) {
        // Write your solution here
    }
};`
    },
    solution: {
      javascript: `function reverseString(s) {
  let left = 0;
  let right = s.length - 1;
  while (left < right) {
    [s[left], s[right]] = [s[right], s[left]];
    left++;
    right--;
  }
  return s;
}`,
      python: `def reverse_string(s):
    left, right = 0, len(s) - 1
    while left < right:
        s[left], s[right] = s[right], s[left]
        left += 1
        right -= 1
    return s`,
      java: `class Solution {
    public void reverseString(char[] s) {
        int left = 0, right = s.length - 1;
        while (left < right) {
            char temp = s[left];
            s[left] = s[right];
            s[right] = temp;
            left++;
            right--;
        }
    }
}`,
      cpp: `class Solution {
public:
    void reverseString(vector<char>& s) {
        int left = 0, right = s.size() - 1;
        while (left < right) {
            swap(s[left], s[right]);
            left++;
            right--;
        }
    }
};`
    },
    testCases: [
      { input: [["h", "e", "l", "l", "o"]], expected: ["o", "l", "l", "e", "h"] },
      { input: [["H", "a", "n", "n", "a", "h"]], expected: ["h", "a", "n", "n", "a", "H"] },
    ],
  },
  {
    id: "palindrome-number",
    title: "Palindrome Number",
    difficulty: "Easy",
    category: "Math",
    description: `Given an integer x, return true if x is a palindrome, and false otherwise.

An integer is a palindrome when it reads the same backward as forward.`,
    examples: [
      { input: "x = 121", output: "true" },
      { input: "x = -121", output: "false" },
    ],
    starterCode: {
      javascript: `function isPalindrome(x) {
  // Write your solution here
}`,
      python: `def is_palindrome(x):
    # Write your solution here
    pass`,
      java: `class Solution {
    public boolean isPalindrome(int x) {
        // Write your solution here
    }
}`,
      cpp: `class Solution {
public:
    bool isPalindrome(int x) {
        // Write your solution here
    }
};`
    },
    solution: {
      javascript: `function isPalindrome(x) {
  if (x < 0) return false;
  const str = x.toString();
  return str === str.split('').reverse().join('');
}`,
      python: `def is_palindrome(x):
    if x < 0:
        return False
    return str(x) == str(x)[::-1]`,
      java: `class Solution {
    public boolean isPalindrome(int x) {
        if (x < 0) return false;
        String str = String.valueOf(x);
        return str.equals(new StringBuilder(str).reverse().toString());
    }
}`,
      cpp: `class Solution {
public:
    bool isPalindrome(int x) {
        if (x < 0) return false;
        string str = to_string(x);
        string rev = str;
        reverse(rev.begin(), rev.end());
        return str == rev;
    }
};`
    },
    testCases: [
      { input: [121], expected: true },
      { input: [-121], expected: false },
      { input: [10], expected: false },
    ],
  },
  {
    id: "fibonacci-number",
    title: "Fibonacci Number",
    difficulty: "Easy",
    category: "Recursion",
    description: `The Fibonacci numbers, commonly denoted F(n), form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1.`,
    examples: [
      { input: "n = 2", output: "1" },
      { input: "n = 4", output: "3" },
    ],
    starterCode: {
      javascript: `function fib(n) {
  // Write your solution here
}`,
      python: `def fib(n):
    # Write your solution here
    pass`,
      java: `class Solution {
    public int fib(int n) {
        // Write your solution here
    }
}`,
      cpp: `class Solution {
public:
    int fib(int n) {
        // Write your solution here
    }
};`
    },
    solution: {
      javascript: `function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}`,
      python: `def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)`,
      java: `class Solution {
    public int fib(int n) {
        if (n <= 1) return n;
        return fib(n - 1) + fib(n - 2);
    }
}`,
      cpp: `class Solution {
public:
    int fib(int n) {
        if (n <= 1) return n;
        return fib(n - 1) + fib(n - 2);
    }
};`
    },
    testCases: [
      { input: [0], expected: 0 },
      { input: [1], expected: 1 },
      { input: [4], expected: 3 },
    ],
  },
  {
    id: "factorial-number",
    title: "Factorial Number",
    difficulty: "Easy",
    category: "Recursion",
    description: `Given a non-negative integer n, return the factorial of n.`,
    examples: [
      { input: "n = 3", output: "6" },
      { input: "n = 5", output: "120" },
    ],
    starterCode: {
      javascript: `function factorial(n) {
  // Write your solution here
}`,
      python: `def factorial(n):
    # Write your solution here
    pass`,
      java: `class Solution {
    public int factorial(int n) {
        // Write your solution here
    }
}`,
      cpp: `class Solution {
public:
    int factorial(int n) {
        // Write your solution here
    }
};`
    },
    solution: {
      javascript: `function factorial(n) {
  if (n === 0) return 1;
  return n * factorial(n - 1);
}`,
      python: `def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n - 1)`,
      java: `class Solution {
    public int factorial(int n) {
        if (n == 0) return 1;
        return n * factorial(n - 1);
    }
}`,
      cpp: `class Solution {
public:
    int factorial(int n) {
        if (n == 0) return 1;
        return n * factorial(n - 1);
    }
};`
    },
    testCases: [
      { input: [0], expected: 1 },
      { input: [3], expected: 6 },
      { input: [5], expected: 120 },
    ],
  },
  {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    category: "String",
    description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    examples: [
      { input: 's = "()"', output: "true" },
      { input: 's = "()[]{}"', output: "true" },
      { input: 's = "(]"', output: "false" }
    ],
    starterCode: {
      javascript: `function isValid(s) {
  // Write your solution here
}`,
      python: `def is_valid(s):
    # Write your solution here
    pass`,
      java: `class Solution {
    public boolean isValid(String s) {
        // Write your solution here
    }
}`,
      cpp: `class Solution {
public:
    bool isValid(string s) {
        // Write your solution here
    }
};`
    },
    solution: {
      javascript: `function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(' || s[i] === '{' || s[i] === '[') {
      stack.push(s[i]);
    } else {
      if (stack.length === 0 || stack.pop() !== map[s[i]]) {
        return false;
      }
    }
  }
  return stack.length === 0;
}`,
      python: `def is_valid(s):
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping:
            top_element = stack.pop() if stack else '#'
            if mapping[char] != top_element:
                return False
        else:
            stack.append(char)
    return not stack`,
      java: `class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else if (stack.isEmpty() || stack.pop() != c) return false;
        }
        return stack.isEmpty();
    }
}`,
      cpp: `class Solution {
public:
    bool isValid(string s) {
        stack<char> st;
        for(char c : s){
            if(c == '(' || c == '{' || c == '[') st.push(c);
            else {
                if(st.empty()) return false;
                if(c == ')' && st.top() != '(') return false;
                if(c == '}' && st.top() != '{') return false;
                if(c == ']' && st.top() != '[') return false;
                st.pop();
            }
        }
        return st.empty();
    }
};`
    },
    testCases: [
      { input: ["()"], expected: true },
      { input: ["()[]{}"], expected: true },
      { input: ["(]"], expected: false },
      { input: ["([)]"], expected: false },
    ],
  },
  {
    id: "contains-duplicate",
    title: "Contains Duplicate",
    difficulty: "Easy",
    category: "Array",
    description: `Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.`,
    examples: [
      { input: "nums = [1,2,3,1]", output: "true" },
      { input: "nums = [1,2,3,4]", output: "false" },
      { input: "nums = [1,1,1,3,3,4,3,2,4,2]", output: "true" }
    ],
    starterCode: {
      javascript: `function containsDuplicate(nums) {
  // Write your solution here
}`,
      python: `def contains_duplicate(nums):
    # Write your solution here
    pass`,
      java: `class Solution {
    public boolean containsDuplicate(int[] nums) {
        // Write your solution here
    }
}`,
      cpp: `class Solution {
public:
    bool containsDuplicate(vector<int>& nums) {
        // Write your solution here
    }
};`
    },
    solution: {
      javascript: `function containsDuplicate(nums) {
  const set = new Set(nums);
  return set.size !== nums.length;
}`,
      python: `def contains_duplicate(nums):
    return len(set(nums)) != len(nums)`,
      java: `class Solution {
    public boolean containsDuplicate(int[] nums) {
        Set<Integer> set = new HashSet<>();
        for (int num : nums) {
            if (!set.add(num)) {
                return true;
            }
        }
        return false;
    }
}`,
      cpp: `class Solution {
public:
    bool containsDuplicate(vector<int>& nums) {
        unordered_set<int> seen;
        for (int num : nums) {
            if (seen.count(num)) return true;
            seen.insert(num);
        }
        return false;
    }
};`
    },
    testCases: [
      { input: [[1, 2, 3, 1]], expected: true },
      { input: [[1, 2, 3, 4]], expected: false },
      { input: [[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]], expected: true },
    ],
  },
  {
    id: "valid-anagram",
    title: "Valid Anagram",
    difficulty: "Easy",
    category: "String",
    description: `Given two strings s and t, return true if t is an anagram of s, and false otherwise.

An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.`,
    examples: [
      { input: 's = "anagram", t = "nagaram"', output: "true" },
      { input: 's = "rat", t = "car"', output: "false" }
    ],
    starterCode: {
      javascript: `function isAnagram(s, t) {
  // Write your solution here
}`,
      python: `def is_anagram(s, t):
    # Write your solution here
    pass`,
      java: `class Solution {
    public boolean isAnagram(String s, String t) {
        // Write your solution here
    }
}`,
      cpp: `class Solution {
public:
    bool isAnagram(string s, string t) {
        // Write your solution here
    }
};`
    },
    solution: {
      javascript: `function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  return s.split('').sort().join('') === t.split('').sort().join('');
}`,
      python: `def is_anagram(s, t):
    if len(s) != len(t):
        return False
    return sorted(s) == sorted(t)`,
      java: `class Solution {
    public boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return false;
        char[] sChars = s.toCharArray();
        char[] tChars = t.toCharArray();
        Arrays.sort(sChars);
        Arrays.sort(tChars);
        return Arrays.equals(sChars, tChars);
    }
}`,
      cpp: `class Solution {
public:
    bool isAnagram(string s, string t) {
        if (s.length() != t.length()) return false;
        sort(s.begin(), s.end());
        sort(t.begin(), t.end());
        return s == t;
    }
};`
    },
    testCases: [
      { input: ["anagram", "nagaram"], expected: true },
      { input: ["rat", "car"], expected: false },
      { input: ["a", "ab"], expected: false },
    ],
  },
  {
    id: "best-time-to-buy-and-sell-stock",
    title: "Best Time to Buy and Sell Stock",
    difficulty: "Easy",
    category: "Array",
    description: `You are given an array prices where prices[i] is the price of a given stock on the ith day.

You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.`,
    examples: [
      { input: "prices = [7,1,5,3,6,4]", output: "5", explanation: "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5." },
      { input: "prices = [7,6,4,3,1]", output: "0", explanation: "In this case, no transactions are done and the max profit = 0." }
    ],
    starterCode: {
      javascript: `function maxProfit(prices) {
  // Write your solution here
}`,
      python: `def max_profit(prices):
    # Write your solution here
    pass`,
      java: `class Solution {
    public int maxProfit(int[] prices) {
        // Write your solution here
    }
}`,
      cpp: `class Solution {
public:
    int maxProfit(vector<int>& prices) {
        // Write your solution here
    }
};`
    },
    solution: {
      javascript: `function maxProfit(prices) {
  let minPrice = Infinity;
  let maxProfit = 0;
  for (let i = 0; i < prices.length; i++) {
    if (prices[i] < minPrice) {
      minPrice = prices[i];
    } else if (prices[i] - minPrice > maxProfit) {
      maxProfit = prices[i] - minPrice;
    }
  }
  return maxProfit;
}`,
      python: `def max_profit(prices):
    min_price = float('inf')
    max_profit = 0
    for price in prices:
        if price < min_price:
            min_price = price
        elif price - min_price > max_profit:
            max_profit = price - min_price
    return max_profit`,
      java: `class Solution {
    public int maxProfit(int[] prices) {
        int minPrice = Integer.MAX_VALUE;
        int maxProfit = 0;
        for (int i = 0; i < prices.length; i++) {
            if (prices[i] < minPrice) {
                minPrice = prices[i];
            } else if (prices[i] - minPrice > maxProfit) {
                maxProfit = prices[i] - minPrice;
            }
        }
        return maxProfit;
    }
}`,
      cpp: `class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int minPrice = INT_MAX;
        int maxProfit = 0;
        for (int price : prices) {
            minPrice = min(minPrice, price);
            maxProfit = max(maxProfit, price - minPrice);
        }
        return maxProfit;
    }
};`
    },
    testCases: [
      { input: [[7, 1, 5, 3, 6, 4]], expected: 5 },
      { input: [[7, 6, 4, 3, 1]], expected: 0 },
      { input: [[1, 2]], expected: 1 },
    ],
  },
  {
    id: "single-number",
    title: "Single Number",
    difficulty: "Easy",
    category: "Array",
    description: `Given a non-empty array of integers nums, every element appears twice except for one. Find that single one.

You must implement a solution with a linear runtime complexity and use only constant extra space.`,
    examples: [
      { input: "nums = [2,2,1]", output: "1" },
      { input: "nums = [4,1,2,1,2]", output: "4" },
      { input: "nums = [1]", output: "1" }
    ],
    starterCode: {
      javascript: `function singleNumber(nums) {
  // Write your solution here
}`,
      python: `def single_number(nums):
    # Write your solution here
    pass`,
      java: `class Solution {
    public int singleNumber(int[] nums) {
        // Write your solution here
    }
}`,
      cpp: `class Solution {
public:
    int singleNumber(vector<int>& nums) {
        // Write your solution here
    }
};`
    },
    solution: {
      javascript: `function singleNumber(nums) {
  let result = 0;
  for (let num of nums) {
    result ^= num;
  }
  return result;
}`,
      python: `def single_number(nums):
    result = 0
    for num in nums:
        result ^= num
    return result`,
      java: `class Solution {
    public int singleNumber(int[] nums) {
        int result = 0;
        for (int num : nums) {
            result ^= num;
        }
        return result;
    }
}`,
      cpp: `class Solution {
public:
    int singleNumber(vector<int>& nums) {
        int result = 0;
        for (int num : nums) {
            result ^= num;
        }
        return result;
    }
};`
    },
    testCases: [
      { input: [[2, 2, 1]], expected: 1 },
      { input: [[4, 1, 2, 1, 2]], expected: 4 },
      { input: [[1]], expected: 1 },
    ],
  }
];

export default problems;