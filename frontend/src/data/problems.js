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
];

export default problems;
